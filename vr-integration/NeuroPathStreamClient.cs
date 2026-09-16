// NeuroPathStreamClient.cs
//
// Drop this into any Unity VR project (Assets/Scripts/) once the VR game exists.
// Polls the Python biofeedback server's REST endpoint every `pollIntervalSeconds`
// and fires a C# event with the parsed reading -- no external packages needed,
// just UnityEngine.Networking (built into every Unity version).
//
// Why polling instead of a WebSocket: Unity's WebSocket support requires either
// a paid/third-party package (NativeWebSocket, etc.) or platform-specific setup.
// UnityWebRequest is built in and works identically in the Editor, on Quest, and
// on PC VR, so it's the lower-friction choice for a hackathon.
//
// Setup:
//   1. Make sure stream_server.py is running (python stream_server.py in MLModel/).
//   2. Add this script to any GameObject in your scene (e.g. an empty "BioFeedbackManager").
//   3. Subscribe to OnReading from your gameplay code, e.g.:
//        GetComponent<NeuroPathStreamClient>().OnReading += reading => {
//            if (reading.stressed) TriggerCalmingVisualCue();
//            careerFitTracker.AddSample(currentLevelId, reading);
//        };

using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

[Serializable]
public class BioReading
{
    public double timestamp;
    public float happiness_index;
    public float sadness_index;
    public float anxiety_stress_index;
    public string predicted_emotion; // "happy_excited" | "calm_content" | "sad_low_energy" | "stressed_anxious"
    public bool stressed;
    public float stress_probability;
}

public class NeuroPathStreamClient : MonoBehaviour
{
    [Tooltip("Base URL of stream_server.py -- change if it's running on another machine on your LAN")]
    public string serverBaseUrl = "http://localhost:5000";

    [Tooltip("How often to poll /latest. 0.2-0.5s feels real-time without hammering the server.")]
    public float pollIntervalSeconds = 0.3f;

    public bool isConnected { get; private set; }
    public BioReading lastReading { get; private set; }

    /// Fired every time a new reading is successfully fetched.
    public event Action<BioReading> OnReading;

    /// Fired once when the server becomes unreachable (e.g. not started yet).
    public event Action OnConnectionLost;

    private Coroutine _pollRoutine;

    private void OnEnable()
    {
        _pollRoutine = StartCoroutine(PollLoop());
    }

    private void OnDisable()
    {
        if (_pollRoutine != null) StopCoroutine(_pollRoutine);
    }

    private IEnumerator PollLoop()
    {
        var wait = new WaitForSeconds(pollIntervalSeconds);
        while (true)
        {
            yield return FetchLatest();
            yield return wait;
        }
    }

    private IEnumerator FetchLatest()
    {
        using (var req = UnityWebRequest.Get($"{serverBaseUrl}/latest"))
        {
            req.timeout = 2;
            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                if (isConnected) OnConnectionLost?.Invoke();
                isConnected = false;
                yield break;
            }

            isConnected = true;
            try
            {
                var reading = JsonUtility.FromJson<BioReading>(req.downloadHandler.text);
                lastReading = reading;
                OnReading?.Invoke(reading);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"NeuroPathStreamClient: failed to parse reading: {e.Message}");
            }
        }
    }

    /// Optional: push a real feature vector to the server (e.g. from a headset SDK
    /// bridge running elsewhere) instead of relying on the synthetic demo feed.
    /// Call this from your own EEG bridge integration, not from gameplay code.
    public IEnumerator PushRealFeatures(
        float alphaLeft, float alphaRight, float betaLeft, float betaRight,
        float theta, float frontalAsymmetry, float betaAlphaRatio, float engagementIndex)
    {
        string json = "{" +
            $"\"alpha_left\":{alphaLeft},\"alpha_right\":{alphaRight}," +
            $"\"beta_left\":{betaLeft},\"beta_right\":{betaRight}," +
            $"\"theta\":{theta},\"frontal_asymmetry\":{frontalAsymmetry}," +
            $"\"beta_alpha_ratio\":{betaAlphaRatio},\"engagement_index\":{engagementIndex}}}";

        using (var req = new UnityWebRequest($"{serverBaseUrl}/ingest", "POST"))
        {
            byte[] body = System.Text.Encoding.UTF8.GetBytes(json);
            req.uploadHandler = new UploadHandlerRaw(body);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            yield return req.SendWebRequest();
        }
    }
}

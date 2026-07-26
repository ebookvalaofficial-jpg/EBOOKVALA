/**
 * Voice Narrator TTS helper.
 * Environment Variable: ELEVENLABS_API_KEY
 */

export interface TTSResult {
  audioUrl?: string;
  isMockFallback?: boolean;
  message?: string;
}

export async function generateTextToSpeech(text: string): Promise<TTSResult> {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  if (elevenLabsKey) {
    try {
      const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel default voice
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: text.slice(0, 1000),
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        return {
          audioUrl: `data:audio/mp3;base64,${base64Audio}`,
          isMockFallback: false,
        };
      } else {
        const errJson = await response.json().catch(() => null);
        const errDetail = errJson?.detail?.message || errJson?.detail?.status || `Status ${response.status}`;
        console.warn(`[ElevenLabs API Notice] ${response.status}: ${errDetail}. Falling back to Browser Web Speech API.`);
        return {
          audioUrl: undefined,
          isMockFallback: true,
          message: `ElevenLabs API (${response.status}): ${errDetail}. Web Speech API activated.`,
        };
      }
    } catch (err: any) {
      console.warn('ElevenLabs API call failed, using audio player interface fallback:', err.message);
    }
  }

  // Graceful Fallback if ELEVENLABS_API_KEY is not configured
  return {
    audioUrl: undefined,
    isMockFallback: true,
    message: 'Voice narration API key not configured. Browser Web Speech API or ElevenLabs key (ELEVENLABS_API_KEY) will enable natural studio voice synthesis.',
  };
}

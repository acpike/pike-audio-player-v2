import { useEffect } from 'react';
import { ResponsiveLayout } from './components/Layout/ResponsiveLayout';
import { SpaceBackground } from './components/Layout/SpaceBackground';
import { AudioPlayer } from './components/Player/AudioPlayer';
import { TrackList } from './components/TrackList/TrackList';
import { DebugPanel } from './components/UI/DebugPanel';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { ColorExtractionProvider } from './components/Effects/ColorExtractionProvider';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useAudioStore } from './stores/audioStore';
import { usePreviewStore } from './stores/previewStore';
import './styles/globals.css';

// V8 Main App - V1_Rewrite_QA_1.6.9.1: Clean audio-first architecture
function App() {
  const { audioRef, playTrack, togglePlayPause, currentTrack, isPlaying, isLoading, hasTrackBeenSelected } = useAudioPlayer();
  const { currentTrackIndex } = useAudioStore();
  const { initializePreviewAudio } = usePreviewStore();

  // Initialize preview audio system on app start
  useEffect(() => {
    initializePreviewAudio();
  }, [initializePreviewAudio]);

  return (
    <ErrorBoundary>
      <ColorExtractionProvider currentTrack={currentTrack}>
        <SpaceBackground>
          <ResponsiveLayout>
            <AudioPlayer 
              audioRef={audioRef}
              currentTrack={currentTrack}
              currentTrackIndex={currentTrackIndex}
              hasTrackBeenSelected={hasTrackBeenSelected}
              isLoading={isLoading}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              playTrack={playTrack}
            />
            <TrackList playTrack={playTrack} togglePlayPause={togglePlayPause} />
            <DebugPanel />
          </ResponsiveLayout>
        </SpaceBackground>
      </ColorExtractionProvider>
    </ErrorBoundary>
  );
}

export default App;
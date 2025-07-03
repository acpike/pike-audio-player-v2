import { ResponsiveLayout } from './components/Layout/ResponsiveLayout';
import { SpaceBackground } from './components/Layout/SpaceBackground';
import { AudioPlayer } from './components/Player/AudioPlayer';
import { TrackList } from './components/TrackList/TrackList';
import { DebugPanel } from './components/UI/DebugPanel';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { ColorExtractionProvider } from './components/Effects/ColorExtractionProvider';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import './styles/globals.css';

// V8 Main App - V1_Rewrite_QA_1.6.9.1: Clean audio-first architecture
function App() {
  const { audioRef, playTrack, togglePlayPause, currentTrack, isPlaying, isLoading, hasTrackBeenSelected } = useAudioPlayer();

  return (
    <ErrorBoundary>
      <ColorExtractionProvider currentTrack={currentTrack}>
        <SpaceBackground>
          <ResponsiveLayout>
            <AudioPlayer 
              audioRef={audioRef}
              currentTrack={currentTrack}
              hasTrackBeenSelected={hasTrackBeenSelected}
              isLoading={isLoading}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
            />
            <TrackList playTrack={playTrack} />
            <DebugPanel />
          </ResponsiveLayout>
        </SpaceBackground>
      </ColorExtractionProvider>
    </ErrorBoundary>
  );
}

export default App;
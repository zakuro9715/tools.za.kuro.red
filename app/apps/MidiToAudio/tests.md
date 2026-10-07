# Tests

## MidiToAudio.test.ts

- MidiToAudio
  - it shows an error for an invalid MIDI file
  - it converts a MIDI file to WAV
  - it shows an error when the sound font cannot be downloaded

## MidiToAudioFileInput.test.ts

- MidiToAudioFileInput
  - it emits the selected file

## MidiToAudioInfo.test.ts

- MidiToAudioInfo
  - it shows file name, duration and track count

## MidiToAudioRenderControls.test.ts

- MidiToAudioRenderControls
  - it emits convert when the convert button is clicked
  - it shows the download button only when done
  - it shows progress while rendering
  - it shows a player without downloading when done

## useMidiToAudio.test.ts

- formatDuration
  - it formats seconds as m:ss
- getMidiInfo
  - it returns duration and track count
- renderMidiToWav
  - it renders a WAV file with the given sample rate
  - it reports progress up to 1

## useSoundFont.test.ts

- fetchSoundFont
  - it downloads the sound font and reports progress
  - it throws when the download fails

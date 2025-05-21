import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import Spinner from './components/Spinner';
import DataDisplay from './components/DataDisplay';
import MusicInfoDisplay from './components/MusicInfoDisplay';
import RangeSlider from './components/RangeSlider';
import SingleValueSlider from './components/SingleValueSlider';
import { ApiResponse, Token, Note, NestedList } from './interfaces/ApiResponse';
import ErrorBoundary from './components/ErrorBoundary';
import NewPianoRollDisplay from './components/NewPianoRollDisplay';
import DemoFile from './components/DemoFile';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import MIDISequencer from "./components/MidiCreate/MIDISequencer";

function App() {
  const listSupportPrograms = ['TSD', 'REMI', 'MIDILike', 'Structured', 'CPWord'];
  const availableTokenizers = ['REMI', 'MIDILike', 'TSD', 'Structured', 'CPWord', 'Octuple', 'PerTok', 'MuMIDI', 'MMM'];

  // Modified response state to include tokenizer info and base_tokenizer
  const [responses, setResponses] = useState<{ file: File, tokenizer: string, base_tokenizer: string, response: ApiResponse | null }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTokenizer, setSelectedTokenizer] = useState<string>('PerTok');
  const [selectedBaseTokenizer, setSelectedBaseTokenizer] = useState<string>('REMI');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showMidiSequencer, setShowMidiSequencer] = useState<boolean>(false);

  // Config states
  const [selectedPitchRange, setSelectedPitchRange] = useState<number[]>([21, 109]);
  const [selectedVelocityBins, setSelectedVelocityBins] = useState<number>(32);
  const [selectedTicksPerQuarter, setTicksPerQuarter] = useState<number>(320);
  const [selectedMaxMicrotimingShift, setMaxMicrotimingShift] = useState<number>(0.125);
  const [selectedNumMicrotimingBins, setNumMicrotimingBins] = useState<number>(30);
  const [specialTokens, setSpecialTokens] = useState<string>("PAD, BOS, EOS, MASK");
  const [useChords, setUseChords] = useState<boolean>(true);
  const [useRests, setUseRests] = useState<boolean>(false);
  const [useTempos, setUseTempos] = useState<boolean>(true);
  const [useMicrotiming, setUseMicrotiming] = useState<boolean>(true);
  const [useTimeSignatures, setUseTimeSignatures] = useState<boolean>(false);
  const [useSustainPedals, setUseSustainPedals] = useState<boolean>(false);
  const [usePitchBends, setUsePitchBends] = useState<boolean>(false);
  const [usePrograms, setUsePrograms] = useState<boolean>(false);
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([-1, 128]);
  const [oneTokenStreamForPrograms, setOneTokenStreamForPrograms] = useState<boolean>(true);
  const [programChanges, setProgramChanges] = useState<boolean>(false);
  const [selectedNbTempos, setSelectedNbTempos] = useState<number>(32);
  const [selectedTempoRange, setSelectedTempoRange] = useState<number[]>([40, 250]);
  const [logTempos, setLogTempos] = useState<boolean>(false);
  const [deleteEqualSuccessiveTempoChanges, setDeleteEqualSuccessiveTempoChanges] = useState<boolean>(false);
  const [sustainPedalDuration, setSustainPedalDuration] = useState<boolean>(false);
  const [pitchBendRange, setPitchBendRange] = useState<number[]>([-8192, 8191]);
  const [pitchBendRangeNumber, setPitchBendRangeNumber] = useState<number>(32);
  const [deleteEqualSuccessiveTimeSigChanges, setDeleteEqualSuccessiveTimeSigChanges] = useState<boolean>(false);
  const [showTokenizerConfig, setShowTokenizerConfig] = useState<boolean>(false);

  // Display states
  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [uploaderVisible, setUploaderVisible] = useState<boolean>(true);

  const [isInDemoMode, setIsInDemoMode] = useState<boolean>(false);

  const toggleMidiSequencer = () => {
    setShowMidiSequencer(!showMidiSequencer);
  };

  const handleMidiFileCreated = (file: File) => {
    if (!uploadedFiles.some(f => f.name === file.name)) {
      setUploadedFiles(prev => [...prev, file]);
      setSelectedFile(file);
      setShowMidiSequencer(false);
    }
  };

  const getUsedTokenizers = () => {
    if (!selectedFile) return [];
    return responses
      .filter(res => res.file.name === selectedFile.name)
      .map(res => res.tokenizer === 'MMM' ? `${res.tokenizer}-${res.base_tokenizer}` : res.tokenizer);
  };
  const hasUploadedCustomFiles = uploadedFiles.some(file => !file.name.includes('DEMO.file'));

  const isTokenizerUsed = (tokenizer: string, baseTokenizer: string | null = null): boolean => {
    if (!selectedFile) return false;
    return responses.some(res =>
      res.file.name === selectedFile.name &&
      res.tokenizer === tokenizer &&
      (tokenizer !== 'MMM' || res.base_tokenizer === baseTokenizer)
    );
  };

  const handleFileUpload = (file: File) => {
    if (!uploadedFiles.some(f => f.name === file.name)) {
      setUploadedFiles(prev => [...prev, file]);
      if (!selectedFile) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = (file: File) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== file));
    setResponses(responses.filter(res => res.file.name !== file.name));
    if (selectedFile === file) {
      setSelectedFile(uploadedFiles.length > 1 ? uploadedFiles.find(f => f !== file) || null : null);
    }
  };

  const handleDemoFileLoaded = (file: File) => {
    if (!uploadedFiles.some(f => f.name === file.name)) {
      setUploadedFiles(prev => [...prev, file]);
      setSelectedFile(file);
    }
  };
  const handleDemoModeChange = (demoMode: boolean) => {
  setIsInDemoMode(demoMode);

  if (!demoMode) {
    setSelectedFile(null);
    setUploadedFiles(prev =>
      prev.filter(file => !file.name.includes('DEMO.file'))
    );
    setResponses(prev =>
      prev.filter(res => !res.file.name.includes('DEMO.file'))
    );
  }
};
  const handleTokenizerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenizer(event.target.value);
  };

  const handleBaseTokenizerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBaseTokenizer(event.target.value);
  };

  const handlePitchRangeChange = (newValues: number[]) => {
    setSelectedPitchRange(newValues);
  };

  const handleVelocityBinsChange = (newValue: number) => {
    setSelectedVelocityBins(newValue);
  };

  const handleTicksPerQuarterChange = (newValue: number) => {
    setTicksPerQuarter(newValue);
  };

  const handleMaxMicrotimingShiftChange = (newValue: number) => {
    setMaxMicrotimingShift(newValue);
  };

  const handleNumMicrotimingBinsChange = (newValue: number) => {
    setNumMicrotimingBins(newValue);
  };

  const handleSpecialTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialTokens(event.target.value);
  };

  const handleUseChordsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseChords(event.target.checked);
  };

  const handleUseRestsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseRests(event.target.checked);
  };

  const handleUseTemposChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseTempos(event.target.checked);
  };

  const handleUseMicrotiming = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseMicrotiming(event.target.checked);
  };

  const handleUseTimeSignaturesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseTimeSignatures(event.target.checked);
  };

  const handleUseSustainPedalsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseSustainPedals(event.target.checked);
  };

  const handleUsePitchBendsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsePitchBends(event.target.checked);
  };

  const handleUseProgramsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsePrograms(event.target.checked);
  };

  const handleProgramsChange = (newValues: number[]) => {
    setSelectedPrograms(newValues);
  };

  const handleOneTokenStreamForProgramsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOneTokenStreamForPrograms(event.target.checked);
  };

  const handleProgramChangesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProgramChanges(event.target.checked);
  };

  const handleNbTemposChange = (newValue: number) => {
    setSelectedNbTempos(newValue);
  };

  const handleTempoRangeChange = (newValues: number[]) => {
    setSelectedTempoRange(newValues);
  };

  const handleLogTemposChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogTempos(event.target.checked);
  };

  const handleDeleteEqualSuccessiveTempoChangesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteEqualSuccessiveTempoChanges(event.target.checked);
  };

  const handleSustainPedalDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSustainPedalDuration(event.target.checked);
  };

  const handlePitchBendRangeChange = (newValues: number[]) => {
    setPitchBendRange(newValues);
  };

  const handlePitchBendRangeNumberChange = (newValue: number) => {
    setPitchBendRangeNumber(newValue);
  };

  const handleDeleteEqualSuccessiveTimeSigChangesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteEqualSuccessiveTimeSigChanges(event.target.checked);
  };

  const toggleTokenizerConfig = () => {
    setShowTokenizerConfig(!showTokenizerConfig);
  };

  const handleNoteHover = (note: Note | null) => {
    setHoveredNote(note);
  };

  function flattenTokens(list: NestedList<Token>): Token[] {
    if (Array.isArray(list)) {
      return list.flatMap(item => (Array.isArray(item) ? flattenTokens(item) : [item]));
    }
    return [list];
  }

  const handleNoteSelect = (note: Note | null) => {
    setSelectedNote(note);
    if (note) {
      const matchingToken = responses
        .flatMap(res => flattenTokens(res.response?.data.tokens ?? []))
        .find(token => token.note_id === note.note_id);
      setSelectedToken(matchingToken || null);
    } else {
      setSelectedToken(null);
    }
  };

  const handleTokenSelect = (token: Token | null) => {
    setSelectedToken(token);
    if (token) {
      const matchingNote = responses
        .flatMap(res => res.response?.data.notes.flat() ?? [])
        .find(note => note.note_id === token.note_id);
      setSelectedNote(matchingNote || null);
    } else {
      setSelectedNote(null);
    }
  };

  const handleTokenHover = (token: Token | null) => {
    setHoveredToken(token);
  };

  const handleTokenize = () => {
    if (!selectedFile) return;

    const existingResponse = responses.find(
      res => res.file.name === selectedFile.name &&
            res.tokenizer === selectedTokenizer &&
            (res.tokenizer !== "MMM" || res.base_tokenizer === selectedBaseTokenizer)
    );

    if (existingResponse) {
      const tokenName = selectedTokenizer === "MMM"
        ? `${selectedTokenizer} with ${selectedBaseTokenizer}`
        : selectedTokenizer;

      if (!window.confirm(`You have already tokenized this file with ${tokenName}. Do you want to override it?`)) {
        return;
      }
      setResponses(responses.filter(res => res !== existingResponse));
    }


    const configData = {
      tokenizer: selectedTokenizer,
      pitch_range: selectedPitchRange,
      num_velocities: selectedVelocityBins,
      special_tokens: specialTokens.split(",").map((token) => token.trim()),
      use_chords: useChords,
      use_rests: useRests,
      use_tempos: useTempos,
      use_time_signatures: useTimeSignatures,
      use_sustain_pedals: useSustainPedals,
      use_pitch_bends: usePitchBends,
      use_programs: usePrograms,
      num_tempos: selectedNbTempos,
      tempo_range: selectedTempoRange,
      log_tempos: logTempos,
      delete_equal_successive_tempo_changes: deleteEqualSuccessiveTempoChanges,
      delete_equal_successive_time_sig_changes: deleteEqualSuccessiveTimeSigChanges,
      sustain_pedal_duration: sustainPedalDuration,
      pitch_bend_range: [...pitchBendRange, pitchBendRangeNumber],
      programs: usePrograms ? selectedPrograms : null,
      one_token_stream_for_programs: usePrograms ? oneTokenStreamForPrograms : null,
      program_changes: usePrograms ? programChanges : null,
      use_microtiming: useMicrotiming,
      ticks_per_quarter: selectedTicksPerQuarter,
      max_microtiming_shift: selectedMaxMicrotimingShift,
      num_microtiming_bins: selectedNumMicrotimingBins,
      base_tokenizer: selectedBaseTokenizer,
    };

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('config', JSON.stringify(configData));

    // Call API
    fetch(`${process.env.REACT_APP_API_BASE_URL}/process`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data: ApiResponse) => {
        setResponses((prevResponses) => [...prevResponses, {
          file: selectedFile,
          tokenizer: selectedTokenizer,
          base_tokenizer: selectedBaseTokenizer,
          response: data
        }]);
      })
      .catch((error) => {
        console.error("Error tokenizing file:", error);
        alert("Failed to tokenize file. Contact the administrator for help.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const responsesByFile = responses.reduce((acc, res) => {
    const fileName = res.file.name;
    if (!acc[fileName]) {
      acc[fileName] = [];
    }
    acc[fileName].push(res);
    return acc;
  }, {} as Record<string, typeof responses>);

  const usedTokenizers = getUsedTokenizers();


  if (showMidiSequencer) {
    return (
      <div className="App">
        <header className="App-header">
          <div
            className="title"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            <span style={{ fontSize: '34px', fontWeight: 'bold', color: 'black' }}>
              MidiTok Visualizer
            </span>
          </div>

          <button
            className="midi-sequencer-button"
            onClick={toggleMidiSequencer}
          >
            ← Go back to tokenizers
          </button>

          <div className="midi-sequencer-wrapper">
            <MIDISequencer onMidiFileCreated={handleMidiFileCreated} />
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div
          className="title"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => window.location.reload()}
        >
          <span style={{ fontSize: '34px', fontWeight: 'bold', color: 'black' }}>
            MidiTok Visualizer
          </span>
        </div>

        <button
          className="midi-sequencer-button"
          onClick={toggleMidiSequencer}
        >
          Make your own MIDI file
        </button>

        {uploaderVisible && (
          <div className="uploader-section">

            <div className={`file-upload-section ${isInDemoMode ? 'file-upload-disabled' : ''}`}>
              <h3>Step 1: Upload MIDI Files</h3>

              <FileUpload onFileSelect={handleFileUpload} acceptedFormats={".mid"} disabled={isInDemoMode}/>

              {uploadedFiles.length > 0 && (
                  <div className="uploaded-files-list">
                    <h4>Uploaded Files:</h4>
                    <ul>
                      {uploadedFiles.map((file, index) => (
                          <li key={index}
                              className={file === selectedFile ? "selected-file" : ""}
                              onClick={() => handleFileSelect(file)}>
                            <span>{file.name}</span>
                            <div>
                              <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(file);
                                  }}
                                  className="remove-button"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </div>

            {!hasUploadedCustomFiles && (
              <div className="demo-file-section">
                <div className="section-divider">
                  <span>OR</span>
                </div>
                <DemoFile
                  onFileLoaded={handleDemoFileLoaded}
                  onDemoModeChange={handleDemoModeChange}
                  isInDemoMode={isInDemoMode}
                />
              </div>
            )}
            {selectedFile && (
                <div className="tokenizer-section">
                  <h3>Step 2: Select Tokenizer</h3>
                  <div className="tokenizer-selection">
                    <select
                        id="tokenizerSelect"
                        value={selectedTokenizer}
                        onChange={handleTokenizerChange}
                    >
                      {availableTokenizers.map(tokenizer => {
                        const isUsed = tokenizer === 'MMM'
                            ? usedTokenizers.some(t => t.startsWith('MMM-'))
                            : usedTokenizers.includes(tokenizer);

                        return (
                            <option
                                key={tokenizer}
                                value={tokenizer}
                            >
                              {tokenizer} {isUsed ? '(Already used)' : ''}
                            </option>
                        );
                      })}
                    </select>

                    {/* Base Tokenizer selector for MMM */}
                    {selectedTokenizer === 'MMM' && (
                        <div className="form-row baseTokenizerSelectContainer" style={{marginTop: '10px'}}>
                          <label htmlFor="baseTokenizerSelect">Base Tokenizer: </label>
                          <select
                              id="baseTokenizerSelect"
                              value={selectedBaseTokenizer}
                              onChange={handleBaseTokenizerChange}
                              style={{width: '100%'}}
                          >
                            <option value="REMI">REMI</option>
                            <option value="MIDILike">MIDI-like</option>
                            <option value="TSD">TSD</option>
                          </select>
                        </div>
                    )}

                    <button
                        type="button"
                        className="tokenizerConfigButton"
                        onClick={toggleTokenizerConfig}
                    >
                      {showTokenizerConfig ? 'Hide Tokenizer Config' : 'Show Tokenizer Config'}
                    </button>
                  </div>

                  {showTokenizerConfig && (
                      <div className="tokenizerConfig">
                        {/* PITCH RANGE */}
                        <div className="form-row">
                          <div className="label-container">
                            <label htmlFor="pitchRange">Select Pitch Range: </label>
                          </div>
                          <div className="select-container">
                            <RangeSlider
                                onRangeChange={handlePitchRangeChange}
                                initialValues={selectedPitchRange}
                                limits={[0, 127]}
                            />
                          </div>
                        </div>

                        {/* VELOCITY BINS */}
                        <div className="form-row">
                          <div className="label-container">
                            <label htmlFor="velocityBins">Number of velocity bins: </label>
                          </div>
                          <div className="select-container">
                            <SingleValueSlider
                                onValueChange={handleVelocityBinsChange}
                                initialValue={selectedVelocityBins}
                                limits={[0, 127]}
                            />
                          </div>
                        </div>

                        {/* SPECIAL TOKENS */}
                        <div className="form-row">
                          <label htmlFor="specialTokens">Special Tokens (comma-separated): </label>
                          <input
                              type="text"
                              id="specialTokens"
                              value={specialTokens}
                              onChange={handleSpecialTokensChange}
                          />
                        </div>

                        {/* CHORDS / RESTS / TEMPOS */}
                        <div className="form-row">
                          <label>
                            <input type="checkbox" checked={useChords} onChange={handleUseChordsChange}/>
                            Use Chords
                          </label>
                          <label>
                            <input type="checkbox" checked={useRests} onChange={handleUseRestsChange}/>
                            Use Rests
                          </label>
                          <label>
                            <input type="checkbox" checked={useTempos} onChange={handleUseTemposChange}/>
                            Use Tempos
                          </label>
                        </div>

                        {/* TIME SIGNATURES / SUSTAIN PEDALS / PITCH BENDS */}
                        <div className="form-row">
                          <label>
                            <input type="checkbox" checked={useTimeSignatures}
                                   onChange={handleUseTimeSignaturesChange}/>
                            Use Time Signatures
                          </label>
                          <label>
                            <input type="checkbox" checked={useSustainPedals} onChange={handleUseSustainPedalsChange}/>
                            Use Sustain Pedals
                          </label>
                          <label>
                            <input type="checkbox" checked={usePitchBends} onChange={handleUsePitchBendsChange}/>
                            Use Pitch Bends
                          </label>
                        </div>

                        {/* USE PROGRAMS */}
                        {(listSupportPrograms.includes(selectedTokenizer) ||
                            (selectedTokenizer === 'MMM' && listSupportPrograms.includes(selectedBaseTokenizer))) && (
                            <div className="form-row">
                              <label>
                                <input type="checkbox" checked={usePrograms} onChange={handleUseProgramsChange}/>
                                Use Programs
                              </label>
                            </div>
                        )}

                        {/* PROGRAMS SLIDER */}
                        {usePrograms && (listSupportPrograms.includes(selectedTokenizer) ||
                            (selectedTokenizer === 'MMM' && listSupportPrograms.includes(selectedBaseTokenizer))) && (
                            <>
                              <div className="form-row">
                                <div className="label-container">
                                  <label htmlFor="programsSlider">MIDI programs: </label>
                                </div>
                                <div className="select-container">
                                  <RangeSlider
                                      onRangeChange={handleProgramsChange}
                                      initialValues={selectedPrograms}
                                      limits={[-1, 128]}
                                  />
                                </div>
                              </div>

                              <div className="form-row">
                                <label>
                                  <input
                                      type="checkbox"
                                      checked={oneTokenStreamForPrograms}
                                      onChange={handleOneTokenStreamForProgramsChange}
                                  />
                                  One Token Stream for Programs
                                </label>
                              </div>

                              {(selectedTokenizer === 'REMI' ||
                                  selectedTokenizer === 'TSD' ||
                                  selectedTokenizer === 'MIDILike' ||
                                  (selectedTokenizer === 'MMM' &&
                                      (selectedBaseTokenizer === 'REMI' ||
                                          selectedBaseTokenizer === 'TSD' ||
                                          selectedBaseTokenizer === 'MIDILike'))) && (
                                  <div className="form-row">
                                    <label>
                                      <input
                                          type="checkbox"
                                          checked={programChanges}
                                          onChange={handleProgramChangesChange}
                                      />
                                      Program Changes
                                    </label>
                                  </div>
                              )}
                            </>
                        )}

                        {/* TEMPO BINS */}
                        <div className="form-row">
                          <div className="label-container">
                            <label htmlFor="nbTempos">Number of tempos bins: </label>
                          </div>
                          <div className="select-container">
                            <SingleValueSlider
                                onValueChange={handleNbTemposChange}
                                initialValue={selectedNbTempos}
                                limits={[0, 100]}
                            />
                          </div>
                        </div>

                        {/* TEMPO RANGE */}
                        <div className="form-row">
                          <div className="label-container">
                            <label htmlFor="tempoRange">Select Tempo Range: </label>
                          </div>
                          <div className="select-container">
                            <RangeSlider
                                onRangeChange={handleTempoRangeChange}
                                initialValues={selectedTempoRange}
                                limits={[0, 350]}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <label>
                            <input type="checkbox" checked={logTempos} onChange={handleLogTemposChange}/>
                            Log Scaled Tempo Values
                          </label>
                        </div>

                        {/* TEMPO/TIME SIG CHANGES */}
                        {selectedTokenizer !== 'Octuple' && (
                            <>
                              <div className="form-row">
                                <label>
                                  <input
                                      type="checkbox"
                                      checked={deleteEqualSuccessiveTempoChanges}
                                      onChange={handleDeleteEqualSuccessiveTempoChangesChange}
                                  />
                                  Delete Equal Successive Tempo Changes
                                </label>
                              </div>
                              <div className="form-row">
                                <label>
                                  <input
                                      type="checkbox"
                                      checked={deleteEqualSuccessiveTimeSigChanges}
                                      onChange={handleDeleteEqualSuccessiveTimeSigChangesChange}
                                  />
                                  Delete Equal Successive Time Signature Changes
                                </label>
                              </div>
                            </>
                        )}

                        <div className="form-row">
                          <label>
                            <input
                                type="checkbox"
                                checked={sustainPedalDuration}
                                onChange={handleSustainPedalDurationChange}
                            />
                            Sustain Pedal Duration
                          </label>
                        </div>

                        {/* PITCH BEND RANGE */}
                        <div className="form-row">
                          <div className="label-container">
                            <label htmlFor="pitchBendRange">Select Pitch Bend Range: </label>
                          </div>
                          <div className="select-container">
                            <RangeSlider
                                onRangeChange={handlePitchBendRangeChange}
                                initialValues={pitchBendRange}
                                limits={[-8192, 8191]}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="label-container">
                            <label htmlFor="pitchBendRangeNumber">Select Pitch Bend Range: </label>
                          </div>
                          <div className="select-container">
                            <SingleValueSlider
                                onValueChange={handlePitchBendRangeNumberChange}
                                initialValue={pitchBendRangeNumber}
                                limits={[0, 100]}
                            />
                          </div>
                        </div>

                        {/* MICROTIMING */}
                        {(selectedTokenizer === 'PerTok' || selectedTokenizer === 'MuMIDI') && (
                            <>
                              <div className="form-row">
                                <label>
                                  <input
                                      type="checkbox"
                                      checked={useMicrotiming}
                                      onChange={handleUseMicrotiming}
                                  />
                                  use Microtiming
                                </label>
                              </div>
                              <div className="form-row">
                                <div className="label-container">
                                  <label htmlFor="ticksPerQuarter">Ticks per quarter: </label>
                                </div>
                                <div className="select-container">
                                  <SingleValueSlider
                                      onValueChange={handleTicksPerQuarterChange}
                                      initialValue={selectedTicksPerQuarter}
                                      limits={[24, 960]}
                                  />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="label-container">
                                  <label htmlFor="maxMicrotimingShift">Max microtiming shifts: </label>
                                </div>
                                <div className="select-container">
                                  <SingleValueSlider
                                      onValueChange={handleMaxMicrotimingShiftChange}
                                      initialValue={selectedMaxMicrotimingShift}
                                      limits={[0, 1]}
                                      step={0.125}
                                  />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="label-container">
                                  <label htmlFor="numMicrotimingBins">Number of microtiming bins: </label>
                                </div>
                                <div className="select-container">
                                  <SingleValueSlider
                                      onValueChange={handleNumMicrotimingBinsChange}
                                      initialValue={selectedNumMicrotimingBins}
                                      limits={[1, 64]}
                                  />
                                </div>
                              </div>
                            </>
                        )}
                      </div>
                  )}

                  <div className="tokenize-button-container">
                    <button
                        className="tokenize-button"
                        onClick={handleTokenize}
                        disabled={loading || !selectedFile || !selectedTokenizer}
                    >
                      {loading ? <Spinner/> : 'Tokenize File'}
                    </button>

                    {selectedFile && isTokenizerUsed(selectedTokenizer, selectedTokenizer === 'MMM' ? selectedBaseTokenizer : null) && (
                        <div className="tokenizer-status-message" style={{marginTop: '5px', color: '#888'}}>
                          {selectedTokenizer === 'MMM'
                              ? `This file is already tokenized with ${selectedTokenizer} with ${selectedBaseTokenizer}. Clicking Tokenize will replace the existing result.`
                              : `This file is already tokenized with ${selectedTokenizer}. Clicking Tokenize will replace the existing result.`
                          }
                        </div>
                    )}
                  </div>
                </div>
            )}
          </div>
        )}

        {responses.length > 0 && (
            <button
                style={{width: '100%', marginTop: 2, marginBottom: 2}}
                className="tokenizerConfigButton"
                onClick={() => setUploaderVisible(!uploaderVisible)}
          >
            {uploaderVisible ? "Hide File Manager" : "Show File Manager"}
          </button>
        )}

        {Object.keys(responsesByFile).length > 0 && (
          <div className="results-section">
            <h3>Step 3: View Results</h3>
            <Tabs>
              <TabList>
                {/* Create main tabs for files */}
                {Object.keys(responsesByFile).map((fileName, index) => (
                  <Tab key={index}>{fileName}</Tab>
                ))}
              </TabList>

              {Object.entries(responsesByFile).map(([fileName, fileResponses], fileIndex) => (
                <TabPanel key={fileIndex}>
                  <Tabs>
                    <TabList>
                      {fileResponses.map((res, tokenizerIndex) => (
                        <Tab key={tokenizerIndex}>
                          {res.tokenizer === "MMM" ? `MMM with ${res.base_tokenizer}` : res.tokenizer}
                        </Tab>
                      ))}
                    </TabList>

                    {fileResponses.map((res, tokenizerIndex) => (
                      <TabPanel key={tokenizerIndex}>
                        {res.response ? (
                          <>
                            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                              <ErrorBoundary fallback={<p>Something went wrong</p>}>
                                {res.response?.data ? (
                                  <>
                                    {(res.tokenizer   && res.tokenizer !== "MMM") && (
                                      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                        <strong>Tokenizer Configuration:</strong> {res.tokenizer}
                                      </div>
                                    )}
                                    {res.tokenizer==="MMM"  && (
                                      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                        <strong>Tokenizer Configuration:</strong> {res.tokenizer} using {res.base_tokenizer} as base tokenizer
                                      </div>
                                    )}
                                    <MusicInfoDisplay data={res.response.data.metrics} />
                                  </>
                                ) : (
                                  res.response?.error
                                )}
                              </ErrorBoundary>
                            </div>

                            <div className="grid-layout">
                              {/* LEFT COLUMN: DataDisplay */}
                            <div className="left-column">
                                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                                  {res.response?.data ? (
                                    <DataDisplay
                                      data={res.response.data.tokens}
                                      hoveredNote={hoveredNote}
                                      selectedNote={selectedNote}
                                      onTokenHover={handleTokenHover}
                                      onTokenSelect={handleTokenSelect}
                                      hoveredToken={hoveredToken}
                                      selectedToken={selectedToken}
                                    />
                                  ) : (
                                    res.response?.error
                                  )}
                                </ErrorBoundary>
                              </div>

                              {/* RIGHT COLUMN: PianoRollDisplay */}
                              <div className="right-column">
                                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                                  {res.response?.data && res.response.data.notes.length > 0 ? (
                                    <Tabs>
                                      <TabList>
                                        {res.response.data.notes.map((_, idx) => (
                                          <Tab key={idx}>Track {idx + 1}</Tab>
                                        ))}
                                      </TabList>
                                      {res.response.data.notes.map((notes, idx) => (
                                        <TabPanel key={idx}>
                                          <NewPianoRollDisplay
                                            notes={res.response?.data?.notes ?? [[]]}
                                            onNoteHover={handleNoteHover}
                                            onNoteSelect={handleNoteSelect}
                                            hoveredToken={hoveredToken}
                                            selectedToken={selectedToken}
                                            track={idx}
                                            file={res.file}
                                          />
                                        </TabPanel>
                                      ))}
                                    </Tabs>
                                  ) : (
                                    res.response?.error
                                  )}
                                </ErrorBoundary>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p>No response data available</p>
                        )}
                      </TabPanel>
                    ))}
                  </Tabs>
                </TabPanel>
              ))}
            </Tabs>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
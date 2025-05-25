import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './MIDICanvas.css';

interface MIDICanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  midiArray: number[][];
  setMidiArray: React.Dispatch<React.SetStateAction<number[][]>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  isErasingDrag: boolean;
  setIsErasingDrag: React.Dispatch<React.SetStateAction<boolean>>;
  firstX: number;
  setFirstX: React.Dispatch<React.SetStateAction<number>>;
  lastX: number;
  setLastX: React.Dispatch<React.SetStateAction<number>>;
  currX: number;
  setCurrX: React.Dispatch<React.SetStateAction<number>>;
  drawBorder: boolean;
  setDrawBorder: React.Dispatch<React.SetStateAction<boolean>>;
  startY: number;
  setStartY: React.Dispatch<React.SetStateAction<number>>;
  playbackPositionX: number;
  isPlaying: boolean;
  isRecording: boolean;
  recordingStartTimeRef: React.MutableRefObject<number>;
  blockWidth: number;
  blockHeight: number;
  fillColor: string;
  eraseColor: string;
  borderColor: string;
  lineWidth: number;
  bpm: number;
  activeVirtualNote: boolean;
  stopPlayback: () => void;
  trackColor: string;
}

const MIDICanvas: React.FC<MIDICanvasProps> = ({
  canvasRef,
  containerRef,
  midiArray,
  setMidiArray,
  isDrawing,
  setIsDrawing,
  isErasingDrag,
  setIsErasingDrag,
  firstX,
  setFirstX,
  lastX,
  setLastX,
  currX,
  setCurrX,
  drawBorder,
  setDrawBorder,
  startY,
  setStartY,
  playbackPositionX,
  isPlaying,
  isRecording,
  recordingStartTimeRef,
  blockWidth,
  blockHeight,
  fillColor,
  eraseColor,
  borderColor,
  lineWidth,
  bpm,
  activeVirtualNote,
  stopPlayback,
  trackColor
}) => {
  const redrawRef = useRef<() => void>(() => {});
  const [forceRedraw, setForceRedraw] = useState(0);
  const isDrawingRef = useRef<boolean>(false);

  const getNoteNameForY = (y: number): string => {
    const highestPitch = 108;
    const pitch = highestPitch - Math.floor(y / blockHeight);

    const octave = Math.floor(pitch / 12) - 1;
    const note = pitch % 12;

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return `${noteNames[note]}${octave}`;
  };

  // Sync ref with state
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    if (!isRecording) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          redrawCanvas();
        }
      }
    }
  }, [isRecording, forceRedraw]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += blockWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      if ((x / blockWidth) % 4 === 0) {
        ctx.fillStyle = '#888';
        ctx.fillText(`${x / blockWidth}`, x + 2, 10);
      }
    }

    for (let y = 0; y < canvas.height; y += blockHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      if (y % blockHeight === 0) {
        const noteName = getNoteNameForY(y);
        ctx.fillStyle = '#444';
        ctx.font = '10px Arial';
        ctx.fillText(noteName, 2, y + 12);
      }
    }

    midiArray.forEach(([fX, lX, sY]) => {
      ctx.fillStyle = trackColor;
      const width = lX - fX + blockWidth;
      ctx.fillRect(fX, sY, width, blockHeight);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(fX + lineWidth / 2, sY + lineWidth / 2, width - lineWidth, blockHeight - lineWidth);

      if (width > 30) {
        const noteName = getNoteNameForY(sY);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(noteName, fX + 3, sY + blockHeight - 3);
      }
    });

    if (isDrawing) {
      ctx.fillStyle = isErasingDrag ? eraseColor : fillColor;
      const currentDrawingStartX = Math.min(firstX, currX);
      const currentDrawingEndX = Math.max(firstX, currX);
      const currentDrawingWidth = currentDrawingEndX - currentDrawingStartX + blockWidth;

      ctx.fillRect(currentDrawingStartX, startY, currentDrawingWidth, blockHeight);

      if (drawBorder) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(
          currentDrawingStartX + lineWidth / 2,
          startY + lineWidth / 2,
          currentDrawingWidth - lineWidth,
          blockHeight - lineWidth
        );
      }
    }

    if (isPlaying && playbackPositionX > 0) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playbackPositionX, 0);
      ctx.lineTo(playbackPositionX, canvas.height);
      ctx.stroke();
    }

    if (isRecording) {

      const now = performance.now();
      const elapsedMs = now - recordingStartTimeRef.current;
      const recordingX = Math.floor((elapsedMs / 1000) * (bpm / 60) * blockWidth);
      if(activeVirtualNote){
      ctx.fillStyle = fillColor;
      ctx.fillRect(currX, startY, recordingX-currX, blockHeight);
      }
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(0, 0, recordingX, canvas.height);

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(recordingX, 0);
      ctx.lineTo(recordingX, canvas.height);
      ctx.stroke();

      ctx.fillStyle = 'red';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('RECORDING', 10, 30);
      const container = containerRef.current;
      if (container && recordingX > container.scrollLeft + container.clientWidth - 200) {
        container.scrollLeft = recordingX - container.clientWidth + 200;
      }
    }
    else{
      if(activeVirtualNote){
      ctx.fillStyle = 'rgba(66, 133, 244, 0.7)';
      ctx.fillRect(0, startY, canvas.width, blockHeight);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const clearWidth = 4;
          ctx.clearRect(playbackPositionX - clearWidth/2, 0, clearWidth, canvas.height);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(playbackPositionX, 0);
          ctx.lineTo(playbackPositionX, canvas.height);
          ctx.stroke();
        }
      }

      if (containerRef.current) {
        const container = containerRef.current;
        if (playbackPositionX > container.scrollLeft + container.clientWidth - 100) {
          container.scrollLeft = playbackPositionX - container.clientWidth / 2;
        }
      }
    }
  }, [playbackPositionX, isPlaying, activeVirtualNote]);

  redrawRef.current = redrawCanvas;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number | null = null;

    const animate = () => {
      redrawCanvas();
      if (isRecording) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isRecording) {
      animate();
    } else {
      redrawCanvas();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  });

  const completeDrawingOperation = (finalX: number) => {
    if (!isDrawingRef.current) return;

    setIsDrawing(false);
    setDrawBorder(false);
    isDrawingRef.current = false;

    const alignedFinalX = finalX - (finalX % blockWidth);
    const actionStartX = Math.min(firstX, alignedFinalX);
    const actionEndX = Math.max(firstX, alignedFinalX);
    const wasErasing = isErasingDrag;

    if (wasErasing) {
      setMidiArray(prevMidiArray => {
        const nextMidiArray: number[][] = [];
        const eraseRectStartX = actionStartX;
        const eraseRectEndX = actionEndX + blockWidth;

        prevMidiArray.forEach(existingBlock => {
          const [existFX, existLX, existSY] = existingBlock;
          if (existSY !== startY) {
            nextMidiArray.push(existingBlock);
            return;
          }
          const existingRectStartX = existFX;
          const existingRectEndX = existLX + blockWidth;
          const intersectStartX = Math.max(existingRectStartX, eraseRectStartX);
          const intersectEndX = Math.min(existingRectEndX, eraseRectEndX);

          if (intersectStartX >= intersectEndX) {
            nextMidiArray.push(existingBlock);
          } else {
            const segmentBeforeStartX = existFX;
            const segmentBeforeEndX = intersectStartX;

            if (segmentBeforeStartX < segmentBeforeEndX) {
              const newLX = segmentBeforeEndX - blockWidth;
              if (segmentBeforeStartX <= newLX) {
                nextMidiArray.push([segmentBeforeStartX, newLX, existSY]);
              }
            }

            const segmentAfterStartX = intersectEndX;
            const segmentAfterEndX = existingRectEndX;

            if (segmentAfterStartX < segmentAfterEndX) {
              const newFX = segmentAfterStartX;
              const newLX = segmentAfterEndX - blockWidth;
              if (newFX <= newLX) {
                nextMidiArray.push([newFX, newLX, existSY]);
              }
            }
          }
        });
        return nextMidiArray;
      });
    } else {
      if (actionStartX <= actionEndX) {
        const newBlock = [actionStartX, actionEndX, startY];
        setMidiArray(prevMidiArray => {
          const nextMidiArray: number[][] = [];
          prevMidiArray.forEach(existingBlock => {
            const [existFX, existLX, existSY] = existingBlock;
            if (existSY !== startY) {
              nextMidiArray.push(existingBlock);
              return;
            }
            const existingRectEnd = existLX + blockWidth;
            const newRectEnd = actionEndX + blockWidth;
            const overlaps = !(existingRectEnd <= actionStartX || existFX >= newRectEnd);

            if (!overlaps) {
              nextMidiArray.push(existingBlock);
            } else {
              const leftPartEnd = actionStartX - blockWidth;
              if (existFX <= leftPartEnd) {
                const leftSegmentLX = Math.min(existLX, leftPartEnd);
                if (existFX <= leftSegmentLX) {
                  nextMidiArray.push([existFX, leftSegmentLX, existSY]);
                }
              }
              const rightPartStart = actionEndX + blockWidth;
              if (existLX + blockWidth >= rightPartStart) {
                const rightSegmentFX = Math.max(existFX, rightPartStart);
                if (rightSegmentFX <= existLX) {
                  nextMidiArray.push([rightSegmentFX, existLX, existSY]);
                }
              }
            }
          });
          if (actionStartX <= actionEndX) {
            nextMidiArray.push(newBlock);
          }
          return nextMidiArray;
        });
      }
    }

    setIsErasingDrag(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newCurrX = x - (x % blockWidth);
      if (newCurrX !== currX) {
        setCurrX(newCurrX);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isPlaying || isRecording) return;
      if (isPlaying) {
        stopPlayback();
      }
      e.preventDefault();

      const isErasing = e.ctrlKey || e.metaKey;
      setIsErasingDrag(isErasing);

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const yPos = e.clientY - rect.top;

      setIsDrawing(true);
      isDrawingRef.current = true;
      const initialX = x - (x % blockWidth);
      const initialY = yPos - (yPos % blockHeight);

      setFirstX(initialX);
      setLastX(initialX);
      setCurrX(initialX);
      setStartY(initialY);
      setDrawBorder(true);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isPlaying || isRecording) return;
      if (!isDrawingRef.current) return;

      let finalX = currX;
      if (e.target === canvas) {
        const rect = canvas.getBoundingClientRect();
        finalX = e.clientX - rect.left;
      }

      completeDrawingOperation(finalX);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (isPlaying || isRecording) return;
      if (!isDrawingRef.current) return;

      completeDrawingOperation(currX);
    };


    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        handleMouseUp(e);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying || isRecording) return;
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsErasingDrag(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPlaying || isRecording) return;
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsErasingDrag(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    isDrawing, isErasingDrag, firstX, currX, startY, blockWidth, blockHeight,
    midiArray, isPlaying, isRecording, drawBorder, stopPlayback, setIsDrawing,
    setIsErasingDrag, setFirstX, setLastX, setCurrX, setStartY, setDrawBorder,
    setMidiArray
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let currentCursor = 'crosshair';

    if (isPlaying || isRecording) {
      currentCursor = 'default';
    } else if (isDrawing) {
      currentCursor = isErasingDrag ? 'grabbing' : 'grabbing';
    } else if (isErasingDrag) {
      currentCursor = 'crosshair';
    }

    container.style.cursor = currentCursor;
    canvas.style.cursor = currentCursor;
  }, [isPlaying, isDrawing, isErasingDrag, isRecording]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const newScrollLeft = Math.round(container.scrollLeft / blockWidth) * blockWidth;
      if (container.scrollLeft !== newScrollLeft) {
        container.scrollLeft = newScrollLeft;
      }

      const newScrollTop = Math.round(container.scrollTop / blockHeight) * blockHeight;
      if (container.scrollTop !== newScrollTop) {
        container.scrollTop = newScrollTop;
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [blockWidth, blockHeight]);

  const renderSidePanel = () => {
    return (
      <div className="note-labels">
        {Array.from({ length: Math.ceil(2000 / blockHeight) }).map((_, index) => (
          <div
            key={`note-label-${index}`}
            className="note-label"
            style={{
              top: index * blockHeight + 2,
              left: 2,
            }}>
            {getNoteNameForY(index * blockHeight)}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 1000;
    }
  }, [containerRef]);

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        ref={containerRef}
        id="canvasContainer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}>
        <canvas
          ref={canvasRef}
          id="can"
          width={3000}
          height={2000}
        />
        {isRecording && (
          <div className="recording-indicator">RECORDING</div>
        )}
        {isPlaying && playbackPositionX > 0 && (
          <div
            className="playback-position"
            style={{ left: `${playbackPositionX}px` }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default MIDICanvas;
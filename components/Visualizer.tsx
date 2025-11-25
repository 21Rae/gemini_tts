import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (rect.width / bufferLength) * 2.5;

    const renderFrame = () => {
      if (!isPlaying) {
        // Draw a flat line or gentle idle wave if stopped
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)'; // Indigo low opacity
        ctx.lineWidth = 2;
        ctx.moveTo(0, rect.height / 2);
        ctx.lineTo(rect.width, rect.height / 2);
        ctx.stroke();
        return;
      }

      animationRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (rect.height * 0.8);

        // Create gradient
        const gradient = ctx.createLinearGradient(0, rect.height, 0, 0);
        gradient.addColorStop(0, '#4f46e5'); // Indigo 600
        gradient.addColorStop(1, '#a855f7'); // Purple 500

        ctx.fillStyle = gradient;
        
        // Rounded tops for bars
        if (barHeight > 0) {
           ctx.fillRect(x, rect.height - barHeight, barWidth - 2, barHeight);
        }

        x += barWidth + 1;
      }
    };

    renderFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-32 bg-slate-900/50 rounded-lg border border-slate-800"
    />
  );
};

export default Visualizer;
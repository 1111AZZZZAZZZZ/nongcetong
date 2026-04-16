import React from 'react';

interface VoiceWaveformProps {
  data: number[]; 
  isListening: boolean;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ data, isListening }) => {
  const width = 120; 
  const height = 24; 
  const barWidth = 4; 
  const gap = 2; 
  
  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className={`h-6 w-32 transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-0'}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {data.map((value, index) => {
        const x = (width / 2) - ((data.length * (barWidth + gap) - gap) / 2) + index * (barWidth + gap);
        // 优化1：增加基础高度到 3px，确保没声音时也能看到清晰的待机点
        // 优化2：放大振幅倍数 (1.5)，让波形跳动得更明显
        const currentBarHeight = Math.max(3, value * height * 1.5); 
        const y = height - currentBarHeight;
        
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={currentBarHeight}
            rx={2} 
            // 优化3：使用内联 HEX 颜色，绝对防止 Tailwind 编译丢失
            style={{ fill: '#16a34a', transition: 'height 0.05s ease-out' }} 
          />
        );
      })}
    </svg>
  );
};

export default VoiceWaveform;
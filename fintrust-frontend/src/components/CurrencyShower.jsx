import React, { useEffect, useRef } from 'react';

export default function CurrencyShower() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let opacity = 1.0;
    let isFading = false;
    const startTime = Date.now();
    const duration = 5000; // 5 seconds of active falling
    const fadeDuration = 1000; // 1 second fade out

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Symbols to use
    const symbols = ['₹', '$', '€', '£', '%', '📈', '💎'];
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20;
        this.type = Math.random() > 0.4 ? 'coin' : 'note'; // coin, note, or star
        if (Math.random() > 0.8) this.type = 'star';
        
        this.size = this.type === 'coin' ? Math.random() * 8 + 8 : Math.random() * 10 + 10;
        this.speedY = Math.random() * 2 + 1.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Colors
        this.coinColor = '#FFD700'; // Gold
        this.noteColor = Math.random() > 0.5 ? '#59CFFF' : '#A7F3D0'; // Sky blue or Emerald green
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
          if (!isFading) {
            this.y = -30;
            this.x = Math.random() * canvas.width;
            this.speedY = Math.random() * 2 + 1.5;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = opacity;

        if (this.type === 'coin') {
          // Draw a gold coin
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.coinColor;
          ctx.fill();
          ctx.strokeStyle = '#B58900';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Draw inner circle
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(181, 137, 0, 0.4)';
          ctx.stroke();

          // Coin Symbol
          ctx.fillStyle = '#6E5200';
          ctx.font = `bold ${this.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.symbol === '$' || this.symbol === '₹' ? this.symbol : '₹', 0, 0);
        } else if (this.type === 'note') {
          // Draw a premium bill/note
          const width = this.size * 2.2;
          const height = this.size * 1.2;
          
          ctx.fillStyle = this.noteColor;
          ctx.fillRect(-width / 2, -height / 2, width, height);
          
          // Border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
          
          // Inner designs
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(0, 0, height * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.font = `${height * 0.6}px Outfit`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.symbol, 0, 0);
        } else {
          // Draw sparkling star/particle
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Star Glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#59CFFF';
          ctx.fillStyle = '#59CFFF';
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Populate particles
    const particleCount = Math.min(65, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        isFading = true;
        const fadeElapsed = elapsed - duration;
        opacity = 1.0 - (fadeElapsed / fadeDuration);
        if (opacity <= 0) {
          opacity = 0;
          cancelAnimationFrame(animationId);
          return; // Stop animation loop
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

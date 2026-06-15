"use client";

/**
 * Animated space background for the Signals page.
 * Uses inline styles + injected <style> for keyframes to guarantee rendering.
 */
export function SpaceBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ss-nebula-drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes ss-twinkle {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        @keyframes ss-shoot {
          0% { opacity: 0; transform: translateX(0) rotate(-25deg); }
          5% { opacity: 1; }
          15% { opacity: 0; transform: translateX(700px) rotate(-25deg); }
          100% { opacity: 0; }
        }
      `}} />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Nebula 1 — purple */}
        <div style={{
          position: "absolute",
          width: 500,
          height: 500,
          top: "-10%",
          left: "-5%",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.35,
          background: "radial-gradient(circle, rgba(100,60,180,0.5) 0%, transparent 70%)",
          animation: "ss-nebula-drift 25s ease-in-out infinite alternate",
        }} />
        {/* Nebula 2 — gold */}
        <div style={{
          position: "absolute",
          width: 400,
          height: 350,
          bottom: "10%",
          right: "-8%",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.35,
          background: "radial-gradient(circle, rgba(212,160,23,0.3) 0%, transparent 70%)",
          animation: "ss-nebula-drift 30s ease-in-out infinite alternate-reverse",
        }} />
        {/* Nebula 3 — blue */}
        <div style={{
          position: "absolute",
          width: 300,
          height: 300,
          top: "40%",
          left: "30%",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.3,
          background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
          animation: "ss-nebula-drift 20s ease-in-out infinite alternate",
        }} />

        {/* Stars — small */}
        <div style={{
          position: "absolute",
          width: 1,
          height: 1,
          borderRadius: "50%",
          boxShadow: `
            120px 50px #ffffff44, 300px 130px #ffffff33, 520px 80px #ffffff22,
            80px 220px #ffffff44, 650px 200px #ffffff33, 900px 90px #ffffff22,
            150px 350px #ffffff33, 400px 420px #ffffff22, 750px 310px #ffffff44,
            50px 500px #ffffff33, 350px 570px #ffffff22, 680px 480px #ffffff33,
            1000px 150px #ffffff22, 1100px 320px #ffffff33, 1200px 50px #ffffff22,
            200px 650px #ffffff33, 550px 620px #ffffff22, 850px 550px #ffffff44,
            1050px 480px #ffffff33, 1150px 600px #ffffff22, 70px 750px #ffffff33,
            420px 800px #ffffff22, 780px 720px #ffffff33, 960px 680px #ffffff22,
            130px 900px #ffffff33, 500px 850px #ffffff22, 830px 900px #ffffff44
          `,
          animation: "ss-twinkle 4s ease-in-out infinite alternate",
        }} />
        {/* Stars — medium */}
        <div style={{
          position: "absolute",
          width: 2,
          height: 2,
          borderRadius: "50%",
          boxShadow: `
            200px 100px #ffffff55, 450px 250px #ffffff44, 700px 50px #ffffff33,
            100px 400px #ffffff44, 350px 300px #ffffff55, 600px 450px #ffffff33,
            850px 200px #ffffff44, 1050px 350px #ffffff33, 250px 550px #ffffff44,
            500px 700px #ffffff33, 750px 600px #ffffff55, 950px 500px #ffffff33,
            150px 800px #ffffff44, 400px 900px #ffffff33, 700px 850px #ffffff44
          `,
          animation: "ss-twinkle 6s ease-in-out infinite alternate-reverse",
        }} />
        {/* Stars — large (some gold-tinted) */}
        <div style={{
          position: "absolute",
          width: 3,
          height: 3,
          borderRadius: "50%",
          boxShadow: `
            300px 180px #e6b840, 680px 120px #ffffff66,
            150px 480px #ffffff55, 550px 380px #d4a017,
            900px 280px #ffffff55, 1100px 100px #e6b840,
            400px 650px #ffffff55, 800px 750px #d4a017
          `,
          animation: "ss-twinkle 8s ease-in-out infinite alternate",
        }} />

        {/* Shooting stars */}
        <div style={{
          position: "absolute",
          top: "15%",
          left: "-5%",
          width: 80,
          height: 1,
          background: "linear-gradient(90deg, rgba(212,160,23,0.8), transparent)",
          borderRadius: 1,
          opacity: 0,
          animation: "ss-shoot 6s 2s ease-out infinite",
        }} />
        <div style={{
          position: "absolute",
          top: "35%",
          left: "-5%",
          width: 100,
          height: 1,
          background: "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)",
          borderRadius: 1,
          opacity: 0,
          animation: "ss-shoot 8s 5s ease-out infinite",
        }} />
        <div style={{
          position: "absolute",
          top: "60%",
          left: "-5%",
          width: 60,
          height: 1,
          background: "linear-gradient(90deg, rgba(212,160,23,0.6), transparent)",
          borderRadius: 1,
          opacity: 0,
          animation: "ss-shoot 10s 8s ease-out infinite",
        }} />
      </div>
    </>
  );
}

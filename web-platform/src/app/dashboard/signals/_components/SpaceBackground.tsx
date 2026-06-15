"use client";

/**
 * Subtle animated space background for the Signals page.
 * Nebula glows + twinkling stars. No shooting stars.
 */
export function SpaceBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ss-drift1 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(25px,-15px) scale(1.08); } }
        @keyframes ss-drift2 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-20px,20px) scale(1.05); } }
        @keyframes ss-twinkle { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }
      `}} />
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Nebula — purple top-left */}
        <div style={{ position: "absolute", width: 450, height: 450, top: "-8%", left: "-4%", borderRadius: "50%", filter: "blur(90px)", opacity: 0.25, background: "radial-gradient(circle, rgba(90,50,160,0.45) 0%, transparent 70%)", animation: "ss-drift1 28s ease-in-out infinite alternate" }} />
        {/* Nebula — gold bottom-right */}
        <div style={{ position: "absolute", width: 350, height: 300, bottom: "5%", right: "-6%", borderRadius: "50%", filter: "blur(90px)", opacity: 0.2, background: "radial-gradient(circle, rgba(212,160,23,0.25) 0%, transparent 70%)", animation: "ss-drift2 32s ease-in-out infinite alternate" }} />
        {/* Nebula — teal center */}
        <div style={{ position: "absolute", width: 250, height: 250, top: "45%", left: "35%", borderRadius: "50%", filter: "blur(80px)", opacity: 0.15, background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)", animation: "ss-drift1 22s ease-in-out infinite alternate-reverse" }} />

        {/* Stars — small */}
        <div style={{ position: "absolute", width: 1, height: 1, borderRadius: "50%", animation: "ss-twinkle 5s ease-in-out infinite alternate", boxShadow: "120px 50px #fff4, 300px 130px #fff3, 520px 80px #fff2, 80px 220px #fff4, 650px 200px #fff3, 900px 90px #fff2, 150px 350px #fff3, 400px 420px #fff2, 750px 310px #fff4, 50px 500px #fff3, 350px 570px #fff2, 680px 480px #fff3, 1000px 150px #fff2, 1100px 320px #fff3, 200px 650px #fff3, 550px 620px #fff2, 850px 550px #fff4, 70px 750px #fff3, 420px 800px #fff2, 780px 720px #fff3, 130px 900px #fff3, 500px 850px #fff2" }} />
        {/* Stars — medium */}
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", animation: "ss-twinkle 7s ease-in-out infinite alternate-reverse", boxShadow: "200px 100px #fff5, 450px 250px #fff4, 700px 50px #fff3, 100px 400px #fff4, 350px 300px #fff5, 600px 450px #fff3, 850px 200px #fff4, 250px 550px #fff4, 500px 700px #fff3, 750px 600px #fff5, 150px 800px #fff4, 400px 900px #fff3" }} />
      </div>
    </>
  );
}

import { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface PlayerBackgroundProps {
  isPlaying: boolean;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

// Inline HTML with the exact halftone wave canvas from the web version
const HALFTONE_HTML = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:#0a0a0a;overflow:hidden}canvas{display:block;width:100%;height:100%}</style>
</head><body><canvas id="c"></canvas><script>
const c=document.getElementById('c'),x=c.getContext('2d');
let t=0,playing=false;
function resize(){c.width=window.innerWidth*window.devicePixelRatio;c.height=window.innerHeight*window.devicePixelRatio;x.scale(window.devicePixelRatio,window.devicePixelRatio)}
resize();window.addEventListener('resize',resize);
function draw(){
  const w2=c.width/window.devicePixelRatio,h2=c.height/window.devicePixelRatio;
  const g=18,rows=Math.ceil(h2/g),cols=Math.ceil(w2/g);
  const bi=playing?0.14:0.07;
  for(let y=0;y<rows;y++){for(let cx2=0;cx2<cols;cx2++){
    const px=cx2*g,py=y*g;
    const d=Math.sqrt((px-w2/2)**2+(py-h2/2)**2);
    const md=Math.sqrt((w2/2)**2+(h2/2)**2);
    const n=d/md;
    const w=Math.sin(n*10-t)*0.5+0.5;
    const s=g*w*0.8*bi*5;
    x.beginPath();x.arc(px,py,Math.max(s/2,0),0,Math.PI*2);
    const h=180+Math.sin(t*0.15+n*3)*40;
    const l=45+Math.sin(t*0.1+n*2)*8;
    const a=Math.min(w*bi,0.45);
    x.fillStyle='hsla('+h+',55%,'+l+'%,'+a+')';
    x.fill();
  }}
}
function animate(){
  const w2=c.width/window.devicePixelRatio,h2=c.height/window.devicePixelRatio;
  const r=Math.round(5+Math.sin(t*0.08)*5);
  const g=Math.round(5+Math.sin(t*0.06+1)*5);
  const b=Math.round(12+Math.sin(t*0.1+2)*8);
  x.fillStyle='rgba('+r+','+g+','+b+',0.12)';
  x.fillRect(0,0,w2,h2);
  draw();
  t+=playing?0.05:0.01;
  requestAnimationFrame(animate);
}
animate();
window.addEventListener('message',function(e){
  try{const d=JSON.parse(e.data);if(d.type==='playState')playing=d.playing;}catch(err){}
});
document.addEventListener('message',function(e){
  try{const d=JSON.parse(e.data);if(d.type==='playState')playing=d.playing;}catch(err){}
});
</script></body></html>`;

export default function PlayerBackground({ isPlaying }: PlayerBackgroundProps) {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'playState', playing: isPlaying })
    );
  }, [isPlaying]);

  return (
    <View style={styles.container} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ html: HALFTONE_HTML }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        opaque={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

import "./App.css";
import React from "react";
import Box from "./components/Box";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import OrthographicNavigationControls from "./OrthographicNavigationControls";

function App() {
  const myCamera = React.useRef();
  return (
    <>
      <Canvas>
        <ambientLight />
        <axesHelper args={[10]} />
        <pointLight position={[10, 10, 10]} />
        <>
          <OrthographicCamera
            position={[0, 0, 3]} // Z is up in CAD land
            // up={[0, 0, 1]} // Z is up in CAD land
            makeDefault={true}
            far={1000}
            // left={-5}
            // right={5}
            near={0.1}
            zoom={100}
            userData={{ main2d: true }}
            ref={myCamera}
          />
          <OrbitControls camera={myCamera.current} />
        </>
        <Box position={[0, 0, 0]} camera={myCamera}/>
        <Stats />
      </Canvas>
    </>
  );
}

export default App;

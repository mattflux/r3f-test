import { useSpring, animated } from "@react-spring/three"
import { useRef, useState } from "react"
import {Mesh} from "three"

export default function Box(props: any) {
    // This reference will give us direct access to the mesh
    const mesh = useRef<Mesh>()
  
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
  
    const {scale,color} = useSpring({
      scale:active ? [1.5,1.5,1.5] : [1,1,1],
      color: hovered ? 'hotpink' : 'orange'
    })
  
    return (
      <animated.mesh
        {...props}
        ref={mesh}
        scale={scale}
        onClick={(event) => {
            setActive(!active);
        }}
        userData={{id: "yo"}}
        onPointerOver={(event) => {
            setHover(true);
            console.log("box position", mesh.current?.position)
        }}
        onPointerOut={(event) => setHover(false)}>
        <boxBufferGeometry args={[0.05, 0.05, 0]} />
        <animated.meshStandardMaterial color={color}/>
      </animated.mesh>
    )
  }
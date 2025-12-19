import { useEffect, useState ,useRef } from "react"
import { Link } from "react-router-dom";
import { Room } from "./Room";

export const Landing = () => {
    const [name, setName] = useState("");
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTracck, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [joined, setJoined] = useState(false);
    
   const getCam = async ()=>{
     const stream = await window.navigator.mediaDevices.getUserMedia({
           video:true,
           audio:true
       })

       //MediaStream
       const audioTrack = stream.getAudioTracks()[0]
       const videoTrack = stream.getVideoTracks()[0]
       setLocalAudioTrack(audioTrack);
       setlocalVideoTrack(videoTrack);
       if(!videoRef.current){
         return;
       }


     
       videoRef.current.srcObject =new MediaStream([videoTrack])
       videoRef.current.play()
   
      }
    useEffect(() => {
       if(videoRef && videoRef.current){
         getCam()
       }
    }, [videoRef]);


    if(!joined){
       return <div>
      <video autoPlay ref={videoRef}></video>
        <input type="text" onChange={(e) => {
            setName(e.target.value);
        }}>
        </input>
        <button onClick={()=>{
          setJoined(true);
        }}>Join</button>
    </div>
    }
   // WRONG: The Room component doesn't know what 'localVideoTrack' is
//     // WRONG: The Room component doesn't know what 'localVideoTrack' is
// return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTracck}/>;

// CORRECT: The Room component expects 'videoAudioTrack'
return <Room name={name} localAudioTrack={localAudioTrack} videoAudioTrack={localVideoTracck}/>;
    
   
}
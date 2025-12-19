import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = ({
    name,
    localAudioTrack,
    videoAudioTrack // <--- 1. We will use this PROP
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    videoAudioTrack: MediaStreamTrack | null,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    
    // REMOVED: unused 'localVideoTrack' state
    
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = io(URL);
        
        socket.on('send-offer', async ({ roomId }) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);

            // FIX 1: Use the PROP, not the empty state
            if (videoAudioTrack) {
                pc.addTrack(videoAudioTrack);
            }
            
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack);
            }

            pc.onicecandidate = async (e) => {
                if(e.candidate){
                    // Handle ICE candidates (optional for local dev)
                }
            }

            // FIX 2: Create offer and emit in the same scope
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            socket.emit("offer", {
                sdp: offer,
                roomId
            });
        });

        socket.on("offer", async ({ roomId, offer }) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription({ sdp: offer, type: "offer" });
            
            const sdp = await pc.createAnswer();
            await pc.setLocalDescription(sdp);
            
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            setRemoteMediaStream(stream);
            setReceivingPc(pc);

            pc.ontrack = (({ track }) => {
                remoteVideoRef.current?.srcObject?.addTrack(track);
                remoteVideoRef.current?.play();
            });

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
        });

        socket.on("answer", ({ roomId, answer }) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription({
                    type: "answer",
                    sdp: answer
                });
                return pc;
            });
        });

        socket.on("lobby", () => {
            setLobby(true);
        });

        setSocket(socket);
    }, [name, localAudioTrack, videoAudioTrack]); // FIX: Added dependencies

    // FIX 1 (Repeated): Use the PROP for local display
    useEffect(() => {
        if (localVideoRef.current && videoAudioTrack) {
            localVideoRef.current.srcObject = new MediaStream([videoAudioTrack]);
            localVideoRef.current.play().catch(e => console.error(e));
        }
    }, [localVideoRef, videoAudioTrack]);

    return (
        <div>
            Hi {name}
            
            {/* FIX 3: Add 'muted' */}
            <video 
                autoPlay 
                width={400} 
                height={400} 
                ref={localVideoRef} 
                muted 
            />
            
            {lobby ? "Waiting to connect you to someone" : null}
            
            <video 
                autoPlay 
                width={400} 
                height={400} 
                ref={remoteVideoRef} 
            />
        </div>
    );
}
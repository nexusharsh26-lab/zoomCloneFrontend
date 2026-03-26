import {
  Badge,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import styles from "./videoMeet.module.css";
import { io, Socket } from "socket.io-client";
import {
  CallEnd,
  Chat,
  MicOff,
  MicOutlined,
  ScreenShare,
  StopScreenShare,
  VideoCameraBackOutlined,218
} from "@mui/icons-material";
import VideoCameraBackIcon from "@mui/icons-material/VideoCameraBack";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import server from "../../../environment";

const server_url = `${server}`;

var connections = {}; //conventional way is using useRef connections = useREf({}), and to use ist connections.current

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoMeet = () => {
  var socketRef = useRef(null); //
  let socketIdRef = useRef(null); //this is our socket id when we connect

  let localVideoRef = useRef(null); // our video we will store in this

  let [videoAvailable, setVideoAvailable] = useState(true); // video hard ware  permission

  let [audioAvailable, setAudioAvailable] = useState(true); // audio hardware permission

  let [video, setVideo] = useState(); // video on off

  let [audio, setAudio] = useState(); // audio on off

  let [screen, setScreen] = useState(); // screen sharing on off

  let [showModal, setModal] = useState(false); // chat section hide and show
  let [screenAvailable, setScreenAvailable] = useState(false);

  let [messages, setMessages] = useState([]); //all messages

  let [message, setMessage] = useState(""); //our message

  let [newMessages, setNewMessages] = useState(); //notification messages number

  let [askForUsername, setAskForUsername] = useState(true); // for guest login usernaeme

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  //   if(isChrome() === false) {
  //   }
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        console.log(videoAvailable, audioAvailable, "here");
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator(); //read on mdn

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 400 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess) //todo getMediaSuccess
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id == socketIdRef.current) continue;

      connections[id].getSenders().forEach((sender) => {
        connections[id].removeTrack(sender);
      });

      // connections[id].addStream(window.localStream);
      window.localStream.getTracks().forEach((track) => {
        connections[id].addTrack(track, window.localStream);
      });

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }
          //  black silience
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            // connections[id].addStream(window.localStream);
            window.localStream.getTracks().forEach((track) => {
              connections[id].addTrack(track, window.localStream);
            });
            connections[id]
              .createOffer()
              .then((description) => {
                connections[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({ sdp: connections[id].localDescription }),
                    );
                  })
                  .catch((e) => console.log(e));
              })
              .catch((e) => console.log(e));
          }
        }),
    );
  };

  //todo
  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e))
          .then();
      }
    }
  };

  //to do add message
  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender: sender, data: data }]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessage) => prevMessage + 1);
    }
  };
  //most imp function
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id)); //removing the left users id using filter
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

          // Create placeholder entry immediately so ontrack never has to "add"
          setVideos((prev) => {
            if (prev.some((v) => v.socketId === socketListId)) return prev;

            const newVideo = {
              socketId: socketListId,
              stream: null, // will be filled by ontrack
              autoPlay: true,
              playsinline: true,
            };

            const updated = [...prev, newVideo];
            videoRef.current = updated;
            return updated;
          });

          connections[socketListId].onicecandidate = (event) => {
            // this is sending you to the signalling server
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };
          connections[socketListId].ontrack = (event) => {
            const remoteStream = event.streams[0];

            setVideos((prevVideos) => {
              const existsIndex = prevVideos.findIndex(
                (v) => v.socketId === socketListId,
              );

              if (existsIndex !== -1) {
                // Just update the stream (this is the normal case for audio+video tracks)
                const updated = [...prevVideos];
                updated[existsIndex] = {
                  ...updated[existsIndex],
                  stream: remoteStream,
                };
                videoRef.current = updated;
                return updated;
              } else {
                // This should almost never happen now (fallback)
                const newVideo = {
                  socketId: socketListId,
                  stream: remoteStream,
                  autoPlay: true,
                  playsinline: true,
                };
                const updated = [...prevVideos, newVideo];
                videoRef.current = updated;
                return updated;
              }
            });
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            // connections[socketListId].addStream(window.localStream);
            // window.localStream.getTracks().forEach((track) => {
            //   connections[socketListId].addTrack(track, window.localStream);
            // });
            window.localStream.getTracks().forEach((track) => {
              const alreadySending = connections[socketListId]
                .getSenders()
                .some((sender) => sender.track === track);

              if (!alreadySending) {
                connections[socketListId].addTrack(track, window.localStream);
              }
            });
          } else {
            //todo blackSilence

            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            // connections[socketListId].addStream(window.localStream);
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
          // };
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              // connections[id2].addStream(window.localStream); //add ours stream to  others
              window.localStream.getTracks().forEach((track) => {
                connections[id2].addTrack(track, window.localStream);
              });
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }), //sdp: session description
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      // connections[id].addStream(window.localStream);
      window.localStream.getTracks().forEach((track) => {
        connections[id].addTrack(track, window.localStream);
      });
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => {
            console.log(e);
          });
      });

      stream.getTracks().forEach(
        (track) =>
          (track.onended = () => {
            setScreen(false);

            try {
              let tracks = localVideoRef.current.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            } catch (e) {
              console.log(e);
            }
            //  black silience
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
          }),
      );
    }
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };
  let routeTo = useNavigate();
  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    routeTo("/home");
  };

  return (
    <Box>
      {askForUsername === true ? (
        <Box>
          <Typography>Enter the Lobby </Typography>
          <TextField
            id="outlined-basics"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          >
            {username}
          </TextField>
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <Box>
            {/* //ref means what ever we can do with documnet .get Element */}
            <video ref={localVideoRef} autoPlay muted />
          </Box>
        </Box>
      ) : (
        <Box sx={{}} className={styles.meetVideoContainer}>
          {showModal === true ? (
            <Box className={styles.chatRoom}>
              <Box className={styles.chatContainer}>
                <Typography sx={{ fontSize: "32px" }}>Chat </Typography>
                <Box className={styles.chattingArea}>
                  <Box className={styles.chattingDisplay}>
                    {messages.length > 0 ? (
                      messages?.map((item, index) => {
                        return (
                          <Box key={index} sx={{ marginBottom: "12px" }}>
                            <Typography sx={{ fontWeight: "700" }}>
                              {item.sender}
                            </Typography>
                            <Typography>{item.data}</Typography>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography>No messages yet</Typography>
                    )}
                  </Box>
                  <TextField
                    label="outlined"
                    placeholder="Enter the chat"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <></>
          )}
          <Box className={styles.buttonContainer}>
            <IconButton onClick={handleVideo}>
              {video === true ? (
                <VideoCameraBackIcon sx={{ color: "white" }} />
              ) : (
                <VideocamOffIcon sx={{ color: "white" }} />
              )}
            </IconButton>
            <IconButton onClick={handleEndCall}>
              <CallEnd sx={{ color: "red" }} />
            </IconButton>
            <IconButton onClick={handleAudio}>
              {audio === true ? (
                <MicOutlined sx={{ color: "white" }} />
              ) : (
                <MicOff sx={{ color: "white" }} />
              )}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen}>
                {screen === true ? (
                  <ScreenShare sx={{ color: "white" }} />
                ) : (
                  <StopScreenShare sx={{ color: "white" }} />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton onClick={() => setModal(!showModal)}>
                {" "}
                <ChatIcon sx={{ color: "white" }} />{" "}
              </IconButton>
            </Badge>
          </Box>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={styles.meetUserVideo}
          />
          <Box className={styles.conferenceView}>
            {videos.map((video) => (
              <Box key={video.socketId}>
                {/* <Typography sx={{ border: "1px solid black" }}>
                  {video.socketId}
                </Typography> */}
                <video
                  data-socket={video?.socketId}
                  ref={(ref) => {
                    if (ref && video?.stream) {
                      ref.srcObject = video?.stream;
                    }
                  }}
                  autoPlay
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoMeet;

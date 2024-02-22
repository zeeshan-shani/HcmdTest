import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Tooltip, useMediaQuery } from "@mui/material";
import {
  addAnnouncement,
  loadAnnouncementList,
} from "redux/actions/chatAction";
import Avatar from "@mui/material/Avatar";
import Autocomplete from "@mui/material/Autocomplete";
import AvatarGroup from "@mui/material/AvatarGroup";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Modal,
  TextField,
  Container,
  Box,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import { Add as AddIcon } from "@mui/icons-material";
import CardHeader from "@mui/material/CardHeader";
import { getPresignedUrl, uploadToS3 } from "utils/AWS_S3/s3Connection";
import { getImageURL } from "redux/common";
import { SocketEmiter, SocketListener } from "utils/wssConnection/Socket";
import designationService from "../../../services/APIs/services/designationService";
import { CHAT_CONST } from "redux/constants/chatConstants";
const AnnouncementComponent = () => {
  const isMobile = useMediaQuery("(max-width:1200px)");
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const storedAnnouncements = useSelector((state) => state.announce);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const { user } = useSelector((state) => state.user);
  const [readBy, setReadBy] = useState({});
  const [designations, setDesignations] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const buttonRef = useRef(null);

  const handleOpenModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenModal(true);
  };
  useEffect(() => {
    dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT });
  }, []);
  const handleCloseModal = () => {
    setSelectedImage(null);
    setOpenModal(false);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  useEffect(() => {
    SocketListener("newAnnouncement", function (announcement) {
      dispatch(addAnnouncement(announcement)); // Dispatch the new announcement
    });
  }, [dispatch]);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await designationService.list({ payload: {} });
        setDesignations(response.data);
      } catch (error) {
        console.error("Error fetching designations:", error);
      }
    };
    fetchDesignations();
    return () => {};
  }, []);

  const handleGroupSelection = (event, selectedOptions) => {
    const selectedIds = selectedOptions.map((option) => option.id);
    setSelectedGroups(selectedIds);
    buttonRef.current.focus();
  };

  useEffect(() => {
    const loadData = () => {
      dispatch(loadAnnouncementList());
    };
    console.log("", readBy);
    loadData();
  }, [dispatch]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };
  const uploadFileToServer = async (file) => {
    if (file) {
      const res = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
      });
      return res.data.url;
    }
  };
  const selectedGroupIDs = selectedGroups;
  //
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if both image and text are provided
    if (!title || !text || !selectedGroups) {
      alert("Please provide all data required for the announcement.");
      return;
    }
    try {
      // Handle image upload
      const fileUrl = await uploadFileToServer(selectedFile);
      const uploadedFileUrl = await uploadToS3(fileUrl, selectedFile);
      // Extract selected group names from state
      const announcementData = {
        message: text,
        image: uploadedFileUrl,
        title,
        isAnnouncement: true,
        announcementTime: new Date().toISOString(),
        selectedGroups: selectedGroupIDs,
      };

      SocketEmiter("createAnnouncement", announcementData);
      setSelectedFile(null);
      setText("");
      setTitle("");
      setSelectedGroups([]);
      handleModalClose();
      dispatch(loadAnnouncementList());
    } catch (error) {
      // Display an error message
      alert("Error submitting announcement. Please try again.", error);
    }
  };
  useEffect(() => {
    if (storedAnnouncements && storedAnnouncements.announcements) {
      storedAnnouncements.announcements.forEach((announcement, index) => {
        SocketEmiter(
          "handleAnnouncementRead",
          { announcementId: announcement.id },
          (err, data) => {
            // console.log("===>",data)
            if (err) {
              // Handle error
              console.error(err);
            } else {
              // Update readBy state for each announcement
              setReadBy((prevState) => ({
                ...prevState,
                [announcement.id]: {
                  announcementId: announcement.id,
                  user: data.users,
                },
              }));
            }
          }
        );
      });
    } else {
      console.log("No announcements available.");
    }
  }, [storedAnnouncements, user]);

  const getFileExtension = (url) => {
    return url.split(".").pop().toLowerCase();
  };

  const styles = {
    paperContainer: {
      backgroundImage: `url(${"https://i.postimg.cc/MTn0p3LJ/wa-bg-image.png"})`,
      backgroundColor: "#c8c8c8",
      padding: "20px",
      border: "1px solid #ccc",
      overflow: "scroll",
      height: "92vh",
    },
  };
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Equivalent to hitting the back button
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Table
        sx={{ backgroundColor: "#f0f2f5" }}
        stickyHeader
        aria-label="sticky table"
      >
        {isMobile && (
          <button style={{ margin: "10px" }} onClick={goBack}>
            <ArrowBackIcon />
          </button>
        )}
        <TableCell>
          <Grid
            container
            direction={{ xs: "column", lg: "row" }}
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="h5"
              sx={{ marginBottom: { xs: "10px", lg: 0 } }}
            >
              Announcements
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
              sx={{
                marginTop: { xs: "10px", lg: 0 },
                marginLeft: { lg: "10px" },
              }}
            >
              <AddIcon />
            </Button>
          </Grid>
        </TableCell>
      </Table>
      {/* Image preview modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="image-preview-modal"
        aria-describedby="image-preview-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxWidth: "90vw",
            maxHeight: "90vh",
          }}
        >
          <img
            src={selectedImage}
            alt="Preview"
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      </Modal>

      <Container maxWidth="xl" sx={styles.paperContainer}>
        <Modal open={modalOpen} onClose={handleModalClose}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "5px",
              outline: "none",
              width: "90%", // Adjust width for smaller screens
              maxWidth: "500px", // Set maximum width
              maxHeight: "90%", // Set maximum height
              overflowY: "auto", // Enable vertical scrolling if content exceeds the height
            }}
          >
            <Typography variant="h6" gutterBottom>
              Create Announcement
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Announcement Title"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <TextField
                label="Announcement Text"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={text}
                onChange={handleTextChange}
                style={{ marginBottom: "10px" }}
              />
              <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                <CloudUploadIcon />
                <input
                  style={{ marginLeft: "5px" }}
                  type="file"
                  onChange={handleFileChange}
                />
              </label>
              <br />
              <Autocomplete
                multiple
                limitTags={2}
                id="multiple-limit-tags"
                options={designations}
                defaultValue={[]}
                getOptionLabel={(option) => option.name} // Display name in Autocomplete
                renderInput={(params) => (
                  <TextField {...params} label="Select Groups" />
                )}
                value={designations.filter((option) =>
                  selectedGroups.includes(option.id)
                )} // Filter selected options by IDs
                onChange={handleGroupSelection}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginTop: "10px" }}
                ref={buttonRef}
              >
                Submit
              </Button>
            </form>
          </div>
        </Modal>
        <p>Total Announcements: {storedAnnouncements?.announcements?.length}</p>
        <div style={{ maxWidth: "50%", minWidth: "250px" }}>
          {(storedAnnouncements?.announcements ?? []).length === 0 ? (
            <p>No announcements available.</p>
          ) : (
            <div>
              {(storedAnnouncements?.announcements ?? []).map(
                (announcement, index) => {
                  // Check if announcement.announcementTime is a string and convert it to a Date object
                  const announcementTime = new Date(
                    announcement.announcementTime
                  );

                  return (
                    <Card
                      key={index}
                      style={{
                        backgroundColor: "#edf2f8",
                        marginTop: "5px",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar
                            aria-label="profile-picture"
                            style={{ backgroundColor: "#44a675" }}
                          >
                            <img
                              src={getImageURL(
                                announcement?.creatorProfilePicture,
                                "80x80"
                              )}
                              alt=""
                              style={{ maxWidth: "100%", height: "auto" }}
                            />
                          </Avatar>
                        }
                        title={announcement.creatorName}
                        subheader={announcementTime.toLocaleDateString(
                          "en-US",
                          {
                            month: "2-digit",
                            day: "2-digit",
                            year: "2-digit",
                          }
                        )}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <span
                            style={{
                              color: "#999",
                              fontStyle: "italic",
                              opacity: 0.8,
                            }}
                          >
                            Title:
                          </span>
                          <span style={{ color: "#333", fontSize: "1.3rem" }}>
                            {announcement.title}
                          </span>
                        </Typography>
                        <Typography>{announcement.message}</Typography>

                        <div>
                          {announcement.image && (
                            <>
                              {getFileExtension(announcement.image).startsWith(
                                "mp4"
                              ) ||
                              getFileExtension(announcement.image).startsWith(
                                "ogg"
                              ) ? (
                                <video
                                  className="img-fluid rounded border"
                                  controls
                                  width="300"
                                  height="300"
                                  style={{ height: "20rem" }}
                                >
                                  <source
                                    src={announcement.image}
                                    type="video/mp4"
                                  />
                                  <source
                                    src={announcement.image}
                                    type="video/ogg"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              ) : getFileExtension(
                                  announcement.image
                                ).startsWith("jpg") ||
                                getFileExtension(announcement.image).startsWith(
                                  "png"
                                ) ? (
                                <img
                                  className="img-fluid rounded border"
                                  style={{ width: "300px" }}
                                  src={announcement.image}
                                  alt=""
                                  controls
                                  onClick={() =>
                                    handleOpenModal(announcement.image)
                                  }
                                />
                              ) : (
                                <div className="preview-file-doc">
                                  <span>{"Preview not available"}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div>
                          {Object.keys(readBy).map((announcementId) => {
                            const readData = readBy[announcementId];
                            if (readData.announcementId === announcement.id) {
                              const uniqueUsers = new Set(); // To store unique users

                              const tooltipContent = (
                                <div
                                  style={{ maxHeight: 200, overflowY: "auto" }}
                                >
                                  {Array.isArray(readData.user)
                                    ? readData.user.map((user) => {
                                        if (!uniqueUsers.has(user.id)) {
                                          uniqueUsers.add(user.id); // Add user to set
                                          return (
                                            <div key={user.id}>
                                              <Avatar
                                                alt={user.name}
                                                src={user.profilePicture}
                                                style={{ marginRight: 8 }}
                                              />
                                              {user.name}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })
                                    : readData.user && (
                                        <div key={readData.user.id}>
                                          <Avatar
                                            alt={readData.user.name}
                                            src={readData.user.profilePicture}
                                            style={{ marginRight: 8 }}
                                          />
                                          {readData.user.name}
                                        </div>
                                      )}
                                </div>
                              );

                              return (
                                <Tooltip
                                  key={announcementId}
                                  title={tooltipContent}
                                  placement="right"
                                  style={{}}
                                >
                                  <AvatarGroup
                                    max={3}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {Object.keys(readBy).map(
                                      (announcementId) => {
                                        const readData = readBy[announcementId];
                                        if (
                                          readData.announcementId ===
                                          announcement.id
                                        ) {
                                          // console.log("easd data",readData.announcementId,"-===-",readData);

                                          if (Array.isArray(readData.user)) {
                                            // console.log("readdata.users",readData.user);
                                            return readData.user.map(
                                              (user, userIndex) => (
                                                <Avatar
                                                  key={userIndex}
                                                  alt={user.name}
                                                  src={user.profilePicture}
                                                  style={{
                                                    width: 32,
                                                    height: 32,
                                                    marginRight: "4px",
                                                  }}
                                                />
                                              )
                                            );
                                          } else if (readData.user) {
                                            return (
                                              <Avatar
                                                key={announcementId}
                                                alt={readData.user.name}
                                                src={user.user.profilePicture}
                                                style={{
                                                  width: 32,
                                                  height: 32,
                                                  marginRight: "4px",
                                                }}
                                              />
                                            );
                                          } else {
                                            return null; // Handle the case where user data is not available
                                          }
                                        }
                                        return null;
                                      }
                                    )}
                                  </AvatarGroup>
                                </Tooltip>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </div>
      </Container>
    </Box>
  );
};

export default AnnouncementComponent;

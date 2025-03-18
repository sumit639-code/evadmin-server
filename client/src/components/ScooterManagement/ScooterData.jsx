import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";

const ScooterData = () => {
  const [selectedModel, setSelectedModel] = useState("All Models");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedScooter, setSelectedScooter] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const fileInputRef = useRef(null);

  const [scooters, setScooters] = useState([]);

  // Fetch scooters on component mount and when filters change
  useEffect(() => {
    fetchScooters();
  }, [selectedModel, selectedStatus]);

  // Extract unique models and set them as options
  useEffect(() => {
    if (scooters.length > 0) {
      const uniqueModels = [
        ...new Set(scooters.map((scooter) => scooter.model)),
      ];
      uniqueModels.sort(); // Sort models alphabetically
      setModelOptions(uniqueModels);
    }
  }, [scooters]);

  // Fetch scooters from API
  // const fetchScooters = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Build query params for filtering
  //     const params = new URLSearchParams();
  //     if (selectedModel !== "All Models") {
  //       params.append("model", selectedModel);
  //     }
  //     if (selectedStatus !== "All Status") {
  //       params.append("status", selectedStatus);
  //     }

  //     const response = await axiosInstance.get(`/scooter?${params.toString()}`);
  //     setScooters(response.data.scooters);

  //     // If we're fetching all scooters (no model filter), update model options
  //     if (selectedModel === "All Models") {
  //       const uniqueModels = [
  //         ...new Set(response.data.scooters.map((scooter) => scooter.model)),
  //       ];
  //       uniqueModels.sort(); // Sort models alphabetically
  //       setModelOptions(uniqueModels);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching scooters:", error);
  //     toast.error("Failed to load scooters");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchScooters = async () => {
    setIsLoading(true);
    try {
      // Build query params for filtering
      const params = new URLSearchParams();
      if (selectedModel !== "All Models") {
        params.append('model', selectedModel);
      }
      if (selectedStatus !== "All Status") {
        params.append('status', selectedStatus);
      }
  
      const response = await axiosInstance.get(`/scooter?${params.toString()}`);
      
      // Make sure image paths are properly handled
      const processedScooters = response.data.scooters.map(scooter => {
        // Ensure the image path is complete
        if (scooter.image && !scooter.image.startsWith('data:') && !scooter.image.startsWith('http')) {
          // If it's a relative path, make sure it works with your server
          // This depends on your server setup, but typically:
          return scooter;
        }
        return scooter;
      });
      
      setScooters(processedScooters);
      
      // If we're fetching all scooters (no model filter), update model options
      if (selectedModel === "All Models") {
        const uniqueModels = [...new Set(processedScooters.map(scooter => scooter.model))];
        uniqueModels.sort(); // Sort models alphabetically
        setModelOptions(uniqueModels);
      }
    } catch (error) {
      console.error('Error fetching scooters:', error);
      toast.error('Failed to load scooters');
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch maintenance logs for a specific scooter
  const fetchMaintenanceLogs = async (scooterId) => {
    try {
      const response = await axiosInstance.get(
        `/scooter/${scooterId}/maintenance-logs`
      );
      setMaintenanceLogs(response.data.maintenanceLogs);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      toast.error("Failed to load maintenance history");
      setMaintenanceLogs([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "On road":
        return "bg-green-100 text-green-800";
      case "In Maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "Offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const handleRowClick = async (scooter) => {
  //   setSelectedScooter(scooter);
  //   setImagePreview(scooter.image);
  //   setEditMode(false);
  //   setModalOpen(true);

  //   // Fetch maintenance logs for the selected scooter
  //   await fetchMaintenanceLogs(scooter.id);
  // };

  const handleRowClick = async (scooter) => {
    setSelectedScooter(scooter);
    
    // If scooter has an image, set it as the preview
    if (scooter.image) {
      setImagePreview(scooter.image);
    } else {
      setImagePreview(null);
    }
    
    setEditMode(false);
    setModalOpen(true);
    
    // Fetch maintenance logs for the selected scooter
    await fetchMaintenanceLogs(scooter.id);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      // Prepare data for API
      const scooterData = {
        model:
          selectedScooter.model === "new"
            ? selectedScooter.newModel
            : selectedScooter.model,
        owner: selectedScooter.owner,
        status: selectedScooter.status,
        pricePerHour:
          parseFloat(selectedScooter.pricePerHour) ||
          selectedScooter.pricePerHour,
        imageData: imagePreview, // Send image data directly
      };

      // Send update request to API
      const response = await axiosInstance.put(
        `/scooter/${selectedScooter.id}`,
        scooterData
      );

      // Update local state
      const updatedScooter = response.data.scooter;

      // If we added a new model, update our model options
      if (selectedScooter.model === "new" && selectedScooter.newModel) {
        if (!modelOptions.includes(selectedScooter.newModel)) {
          setModelOptions([...modelOptions, selectedScooter.newModel].sort());
        }
      }

      setScooters(
        scooters.map((s) => (s.id === selectedScooter.id ? updatedScooter : s))
      );
      setSelectedScooter(updatedScooter);
      setImagePreview(updatedScooter.image); // Update image preview to use the server path
      setEditMode(false);
      toast.success("Scooter updated successfully");
    } catch (error) {
      console.error("Error updating scooter:", error);
      toast.error("Failed to update scooter");
    }
  };

  // const handleSave = async () => {
  //   try {
  //     // Prepare data for API
  //     const scooterData = {
  //       model: selectedScooter.model === "new" ? selectedScooter.newModel : selectedScooter.model,
  //       owner: selectedScooter.owner,
  //       status: selectedScooter.status,
  //       pricePerHour: parseFloat(selectedScooter.pricePerHour) || selectedScooter.pricePerHour,
  //       // Add additional fields if needed
  //     };

  //     // Send update request to API
  //     const response = await axiosInstance.put(`/scooter/${selectedScooter.id}`, scooterData);

  //     // Update local state
  //     const updatedScooter = response.data.scooter;

  //     // If we added a new model, update our model options
  //     if (selectedScooter.model === "new" && selectedScooter.newModel) {
  //       if (!modelOptions.includes(selectedScooter.newModel)) {
  //         setModelOptions([...modelOptions, selectedScooter.newModel].sort());
  //       }
  //     }

  //     setScooters(scooters.map(s => s.id === selectedScooter.id ? updatedScooter : s));
  //     setSelectedScooter(updatedScooter);
  //     setEditMode(false);
  //     toast.success('Scooter updated successfully');
  //   } catch (error) {
  //     console.error('Error updating scooter:', error);
  //     toast.error('Failed to update scooter');
  //   }
  // };

  const handleInputChange = (e) => {
    setSelectedScooter({ ...selectedScooter, [e.target.name]: e.target.value });
  };

  const handleAddNewScooter = () => {
    setSelectedScooter({
      id: "",
      model: "",
      owner: "",
      status: "On road",
      pricePerHour: 150,
      image: null,
      newModel: "", // Initialize newModel field
    });
    setImagePreview(null);
    setEditMode(true);
    setModalOpen(true);
  };

  // const handleSaveNewScooter = async () => {
  //   // Check if required fields are filled
  //   if (
  //     selectedScooter.owner &&
  //     selectedScooter.pricePerHour &&
  //     (
  //       (selectedScooter.model && selectedScooter.model !== "new") ||
  //       (selectedScooter.model === "new" && selectedScooter.newModel)
  //     )
  //   ) {
  //     try {
  //       // Determine the actual model to use
  //       const modelToUse = selectedScooter.model === "new" ? selectedScooter.newModel : selectedScooter.model;

  //       // Prepare data for API
  //       const scooterData = {
  //         model: modelToUse,
  //         owner: selectedScooter.owner,
  //         status: selectedScooter.status,
  //         scooterId: Date.now().toString(),
  //         pricePerHour: parseFloat(selectedScooter.pricePerHour)
  //       };

  //       // Send create request to API
  //       const response = await axiosInstance.post(`/scooter`, scooterData);

  //       // If we added a new model, update our model options
  //       if (selectedScooter.model === "new" && selectedScooter.newModel) {
  //         if (!modelOptions.includes(selectedScooter.newModel)) {
  //           setModelOptions([...modelOptions, selectedScooter.newModel].sort());
  //         }
  //       }

  //       // Update local state
  //       setScooters([...scooters, response.data.scooter]);
  //       setModalOpen(false);
  //       toast.success('New scooter added successfully');

  //       // Refresh the list
  //       fetchScooters();
  //     } catch (error) {
  //       console.error('Error creating scooter:', error);
  //       toast.error('Failed to add new scooter');
  //     }
  //   } else {
  //     toast.error('Please fill all required fields');
  //   }
  // };

  const handleSaveNewScooter = async () => {
    // Check if required fields are filled
    if (
      selectedScooter.owner &&
      selectedScooter.pricePerHour &&
      ((selectedScooter.model && selectedScooter.model !== "new") ||
        (selectedScooter.model === "new" && selectedScooter.newModel))
    ) {
      try {
        // Determine the actual model to use
        const modelToUse =
          selectedScooter.model === "new"
            ? selectedScooter.newModel
            : selectedScooter.model;

        // Prepare data for API
        const scooterData = {
          model: modelToUse,
          owner: selectedScooter.owner,
          status: selectedScooter.status,
          scooterId: Date.now().toString(),
          pricePerHour: parseFloat(selectedScooter.pricePerHour),
          imageData: imagePreview, // Send image data directly
        };

        // Send create request to API
        const response = await axiosInstance.post(`/scooter`, scooterData);

        // If we added a new model, update our model options
        if (selectedScooter.model === "new" && selectedScooter.newModel) {
          if (!modelOptions.includes(selectedScooter.newModel)) {
            setModelOptions([...modelOptions, selectedScooter.newModel].sort());
          }
        }

        // Update local state
        setScooters([...scooters, response.data.scooter]);
        setModalOpen(false);
        toast.success("New scooter added successfully");

        // Refresh the list
        fetchScooters();
      } catch (error) {
        console.error("Error creating scooter:", error);
        toast.error("Failed to add new scooter");
      }
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const validateImageFile = (file) => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return false;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return false;
    }

    return true;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate the file
      if (!validateImageFile(file)) {
        return;
      }

      // Create preview for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayImage = (image) => {
    // If image is null/undefined, return null
    if (!image) return null;
    
    // If it's already a data URL (starts with data:), return it as is
    if (image.startsWith('data:')) {
      return image;
    }
    
    // If it's a server path, prepend the backend URL
    const BACKEND_URL = 'http://localhost:3000'; // Replace with your actual backend URL
    return `${BACKEND_URL}${image}`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Filters
          </button>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-gray-300 rounded-md text-sm py-2 px-3 text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="All Models">All Models</option>
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md text-sm py-2 px-3 text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="All Status">All Status</option>
            <option value="On road">On road</option>
            <option value="In Maintenance">In Maintenance</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <button
          onClick={handleAddNewScooter}
          className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800 flex items-center"
        >
          Add New Scooter
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading scooters...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scooter ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scooters.map((scooter) => (
                <tr
                  key={scooter.id}
                  onClick={() => handleRowClick(scooter)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {scooter.scooterId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scooter.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scooter.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        scooter.status
                      )}`}
                    >
                      {scooter.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {scooters.length} scooters
        </div>
        <div className="flex items-center space-x-2">
          <button className="border border-gray-300 rounded-md p-2">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="border border-gray-300 rounded-md p-2">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">
                  {editMode
                    ? selectedScooter.id
                      ? "Edit Scooter"
                      : "Add New Scooter"
                    : "Scooter Details"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-6">
                  {/* <div className="relative w-48 h-48 bg-gray-200 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Scooter" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                    )}
                    {editMode && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    )}
                    {editMode && (
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div> */}
                  <div className="relative w-48 h-48 bg-gray-200 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={displayImage(imagePreview)}
                        alt="Scooter"
                        className="w-full h-full object-cover"
                      />
                    ) : selectedScooter?.image ? (
                      <img
                        src={displayImage(selectedScooter.image)}
                        alt="Scooter"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No Image
                      </div>
                    )}
                    {editMode && (
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    )}
                    {editMode && (
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium">Owner: </span>
                        {editMode ? (
                          <input
                            type="text"
                            name="owner"
                            value={selectedScooter.owner}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          <span>{selectedScooter?.owner}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Model no: </span>
                        {editMode ? (
                          <select
                            name="model"
                            value={selectedScooter.model}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1"
                          >
                            <option value="">Select a model</option>
                            {modelOptions.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                            <option value="new">+ Add New Model</option>
                          </select>
                        ) : (
                          <span>{selectedScooter?.model}</span>
                        )}
                      </div>
                      {/* Allow input if "Add New Model" is selected */}
                      {editMode && selectedScooter.model === "new" && (
                        <div>
                          <span className="font-medium">New Model: </span>
                          <input
                            type="text"
                            name="newModel"
                            value={selectedScooter.newModel || ""}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1 mt-1"
                            placeholder="Enter new model name"
                            required
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Status: </span>
                        {editMode ? (
                          <select
                            name="status"
                            value={selectedScooter.status}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1"
                          >
                            <option value="On road">On road</option>
                            <option value="In Maintenance">
                              In Maintenance
                            </option>
                            <option value="Offline">Offline</option>
                          </select>
                        ) : (
                          <span>{selectedScooter?.status}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">
                          Price per Hour (₹):{" "}
                        </span>
                        {editMode ? (
                          <input
                            type="number"
                            name="pricePerHour"
                            value={selectedScooter.pricePerHour}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1"
                            min="0"
                            step="10"
                          />
                        ) : (
                          <span>₹{selectedScooter?.pricePerHour}</span>
                        )}
                      </div>
                    </div>
                    {!editMode && (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit details
                      </button>
                    )}
                  </div>
                </div>

                {!editMode && (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Model
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Maintained
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {maintenanceLogs.length > 0 ? (
                            maintenanceLogs.map((record, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.model}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.lastMaintained}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-6 py-4 text-center text-sm text-gray-500"
                              >
                                No maintenance records found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="h-[200px] rounded-lg border">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.5788316769823!2d4.8852008!3d52.3584089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609ef96d35a5f%3A0x3cc8701575536c70!2sVan%20Gogh%20Museum!5e0!3m2!1sen!2snl!4v1635959562000!5m2!1sen!2snl"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Scooter Location"
                      ></iframe>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  {editMode ? (
                    <button
                      onClick={
                        selectedScooter.id ? handleSave : handleSaveNewScooter
                      }
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScooterData;

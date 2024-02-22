import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Row, Col } from 'react-bootstrap';

const TourGuidePage = () => {
  const [data, setData] = useState([]);
  const [newRow, setNewRow] = useState({ title: '', description: '', id: '' });
  const [editingIndex, setEditingIndex] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('data')) || [];
    setData(savedData);
  }, []);

  const handleInputChange = (e, key) => {
    setNewRow({ ...newRow, [key]: e.target.value });
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      // Update existing data
      const updatedData = [...data];
      updatedData[editingIndex] = { ...newRow }; // Use spread operator to create a new object
      setData(updatedData);

      // Update existing data in localStorage
    const localStorageData = JSON.parse(localStorage.getItem('data')) || [];
    localStorageData[editingIndex] = { ...newRow };
    localStorage.setItem('data', JSON.stringify(localStorageData));
    } else {
      // Add new data
      setData([...data, newRow]);
      // Save the updated data to localStorage
    localStorage.setItem('data', JSON.stringify([...data, newRow]));
    }

    // Save the updated data to localStorage

    // Clear the input fields and reset editingIndex
    setNewRow({ title: '', description: '', id: '' });
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    // Set the row to be edited and the editingIndex
    setNewRow(data[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    // Delete the data at the specified index
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);

    // Save the updated data to localStorage
    localStorage.setItem('data', JSON.stringify(updatedData));
  };

  return (
    <div style={{ padding: "5px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }} id='tour-guidence'>
      <h1 id='tour-guidence-header'>Tour Guide</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Form.Control
                type="text"
                placeholder="Title"
                value={newRow.title}
                onChange={(e) => handleInputChange(e, 'title')}
              />
            </td>
            <td>
              <Form.Control
                type="text"
                placeholder="Description"
                value={newRow.description}
                onChange={(e) => handleInputChange(e, 'description')}
              />
            </td>
            <td>
              <Form.Control
                type="text"
                placeholder="ID"
                value={newRow.id}
                onChange={(e) => handleInputChange(e, 'id')}
              />
            </td>
            <td>
              <Button onClick={handleSave}>{editingIndex !== null ? 'Update' : 'Save'}</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      <div style={{ marginTop: "2rem" }}>
        <h2>Saved Data</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.id}</td>
                <td>
                  <Button variant="info" onClick={() => handleEdit(index)}>Edit</Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(index)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default TourGuidePage;

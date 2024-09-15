import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { fetchRepositoryById, fetchRepositoryFiles, fetchCommits, createIssue, fetchIssues, updateIssue, deleteIssue } from '../../api/repoAPI';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Queue } from '../utility/queueUtils';
import { useParams } from 'react-router-dom'; // Import useParams to get repoId from the URL
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap'; // Bootstrap Modal
import "./repositoryView.css";


const RepositoryView = () => {
  const { repoId } = useParams(); // Get repoId from the URL
  const [repository, setRepository] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [commits, setCommits] = useState([]);
  const [issuesQueue, setIssuesQueue] = useState(new Queue());
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState({ title: "", description: "" });
  const [editingIssue, setEditingIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchData = async () => {
      if (repoId) {
        try {
          // Fetch repository using repoId
          const repoData = await fetchRepositoryById(repoId); 
          console.log("Fetched repository data:", repoData);
          setRepository(repoData);

          // Fetch files and commits using the repoId
          const fileData = await fetchRepositoryFiles(repoId);
          console.log("Fetched file data:", fileData);
          setFiles(fileData.files || []);
          setFolders(fileData.folderStructure || []);

          const commitData = await fetchCommits(repoId);
          console.log("Fetched commit data:", commitData);
          setCommits(commitData);
        } catch (err) {
          console.error("Error fetching repository data: ", err);
        }
      }
    };

    fetchData();
  }, [repoId]);

  useEffect(() => {
    const fetchIssuesForRepo = async () => {
      if (repository && repository._id) {
        try {
          const issueData = await fetchIssues(repository._id);
          console.log("Fetched issue data:", issueData);
          const issueQueue = new Queue();
          issueData.forEach(issue => issueQueue.enqueue(issue));
          setIssuesQueue(issueQueue);
        } catch (err) {
          console.error("Error fetching issues: ", err);
        }
      }
    };

    fetchIssuesForRepo();
  }, [repository]);

  useEffect(() => {
    const processQueue = () => {
      const issuesList = [];
      while (!issuesQueue.isEmpty()) {
        issuesList.push(issuesQueue.dequeue());
      }
      console.log("Processed issues list:", issuesList);
      setIssues(issuesList);
    };

    processQueue();
  }, [issuesQueue]);

  const handleIssueCreate = async () => {
    try {
      await createIssue({ 
        title: newIssue.title, 
        description: newIssue.description, 
        repoId: repository._id 
      });
      setNewIssue({ title: "", description: "" });

      if (repository && repository._id) {
        const issueData = await fetchIssues(repository._id);
        console.log("Fetched issue data after creation:", issueData);
        const issueQueue = new Queue();
        issueData.forEach(issue => issueQueue.enqueue(issue));
        setIssuesQueue(issueQueue);
      }
    } catch (err) {
      console.error("Error creating issue: ", err);
    }
  };

  const handleIssueUpdate = async () => {
    if (editingIssue) {
      try {
        await updateIssue(editingIssue._id, {
          title: editingIssue.title,
          description: editingIssue.description,
          status: editingIssue.status
        });
        setEditingIssue(null);
        const issueData = await fetchIssues(repository._id);
        console.log("Fetched issue data after update:", issueData);
        const issueQueue = new Queue();
        issueData.forEach(issue => issueQueue.enqueue(issue));
        setIssuesQueue(issueQueue);
      } catch (err) {
        console.error("Error updating issue: ", err);
      }
    }
  };

  const handleIssueDelete = async (issueId) => {
    try {
      await deleteIssue(issueId);
      const issueData = await fetchIssues(repository._id);
      console.log("Fetched issue data after deletion:", issueData);
      const issueQueue = new Queue();
      issueData.forEach(issue => issueQueue.enqueue(issue));
      setIssuesQueue(issueQueue);
    } catch (err) {
      console.error("Error deleting issue: ", err);
    }
  };

  const handleEditClick = (issue) => {
    setEditingIssue(issue);
  };

  const handleFileClick = async (file) => {
    try {
      // Fetch the file content from the provided URL
      const response = await fetch(file.url);
      const text = await response.text();

      // Set the file content and open the modal
      setFileContent(text);
      setSelectedFile(file);
      setIsModalOpen(true); // Ensure modal opens after setting the state
    } catch (err) {
      console.error("Error fetching file content: ", err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileContent("");
  };

  return (
    <>
      <Navbar />
      <section id="repository-view" className="container my-4">
        <main className="row">
          <div className="col-md-3">
            <div className="mb-3 p-3 bg-dark rounded shadow-sm">
              <h5>Folder Structure</h5>
              {folders.length > 0 ? (
                <ul className="list-group">
                  {folders.map((folder) => (
                    <li key={folder.path} className="list-group-item">{folder.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No folders found in this repository.</p>
              )}
            </div>

            <div className="mb-3 p-3 bg-dark rounded shadow-sm">
              <h5>Commits</h5>
              {commits.length > 0 ? (
                <ul className="list-group">
                  {commits.map((commit) => (
                    <li key={commit.id} className="list-group-item">
                      <p><strong>Message:</strong> {commit.message}</p>
                      <p><strong>Date:</strong> {commit.date}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No commits found for this repository.</p>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3 p-3 bg-dark rounded shadow-sm">
              <h2>Files</h2>
              {files.length > 0 ? (
                <ul className="list-group">
                  {files.map((file) => (
                    <li key={file.name} className="list-group-item">
                      <button className="btn btn-outline-primary" onClick={() => handleFileClick(file)}>
                        {file.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No files found in this repository.</p>
              )}
            </div>
          </div>

          <div className="col-md-3">
            <div className="mb-3 p-3 bg-dark rounded shadow-sm">
              <h6>
                Repository ID: {repository ? repository._id : "Not Loaded"}
              </h6>

              <h5>Create New Issue</h5>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Title"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" onClick={handleIssueCreate}>Create Issue</button>

              {editingIssue && (
                <div className="mt-4 p-3 bg-dark rounded shadow-sm">
                  <h5>Update Issue</h5>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title"
                      value={editingIssue.title}
                      onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      placeholder="Description"
                      value={editingIssue.description}
                      onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                    />
                  </div>
                  <button className="btn btn-success" onClick={handleIssueUpdate}>Update Issue</button>
                  <button className="btn btn-secondary" onClick={() => setEditingIssue(null)}>Cancel</button>
                </div>
              )}
            </div>

            <div className="mb-3 p-3 bg-dark rounded shadow-sm">
              <h5>Issues</h5>
              {issues.length > 0 ? (
                <ul className="list-group">
                  {issues.map((issue) => (
                    <li key={issue._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <strong>{issue.title}</strong> - {issue.description}
                      </span>
                      <span>
                        <FaEdit className="text-primary" onClick={() => handleEditClick(issue)} style={{ cursor: 'pointer', marginRight: '10px' }} />
                        <FaTrash className="text-danger" onClick={() => handleIssueDelete(issue._id)} style={{ cursor: 'pointer' }} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No issues found for this repository.</p>
              )}
            </div>
          </div>
        </main>

        {/* Bootstrap Modal for displaying file content */}
        <Modal show={isModalOpen} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedFile?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <pre>{fileContent}</pre>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    </>
  );
};

export default RepositoryView;

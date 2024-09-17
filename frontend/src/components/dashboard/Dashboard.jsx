import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [repoToUpdate, setRepoToUpdate] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/repo/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("Error fetching repositories");
        }
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/all`);
        if (!response.ok) {
          throw new Error("Error fetching suggested repositories");
        }
        const data = await response.json();
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const handleRepoClick = (repoId) => {
    navigate(`/repo/${repoId}`);
  };

  const handleUpdate = async () => {
    if (repoToUpdate) {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/update/${repoToUpdate}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updateName,
            description: updateDescription,
          }),
        });
        if (!response.ok) {
          throw new Error("Error updating repository");
        }
        const updatedRepo = await response.json();
        setRepositories((prev) =>
          prev.map((repo) =>
            repo._id === updatedRepo._id ? updatedRepo : repo
          )
        );
        setRepoToUpdate(null);
        setUpdateName("");
        setUpdateDescription("");
      } catch (err) {
        console.error("Error updating repository: ", err);
      }
    }
  };

  const handleDelete = async (repoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repo/delete/${repoId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error deleting repository");
      }
      setRepositories((prev) =>
        prev.filter((repo) => repo._id !== repoId)
      );
    } catch (err) {
      console.error("Error deleting repository: ", err);
    }
  };

  const handleButtonClick = (e, repoId, action) => {
    e.stopPropagation(); // Prevents the click event from propagating to parent elements
    if (action === "update") {
      setRepoToUpdate(repoId);
      const repo = repositories.find((r) => r._id === repoId);
      setUpdateName(repo.name);
      setUpdateDescription(repo.description);
    } else if (action === "delete") {
      handleDelete(repoId);
    }
  };

  return (
    <>
      <Navbar />
      <section id="dashboard" className="container my-4">
        {/* Suggested Repositories Section */}
        <aside className="suggested-repositories">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Suggested Repositories</h5>
              {suggestedRepositories.length > 0 ? (
                suggestedRepositories.map((repo) => (
                  <div
                    key={repo._id}
                    onClick={() => handleRepoClick(repo._id)}
                    className="repo-item"
                    style={{ cursor: "pointer" }}  // Ensure it's clickable
                  >
                    <h6 className="card-subtitle mb-2 text-muted">
                      {repo.name}
                    </h6>
                    <p className="card-text">{repo.description}</p>
                  </div>
                ))
              ) : (
                <p>No suggested repositories available.</p>
              )}
            </div>
          </div>
        </aside>

        {/* User Repositories Section */}
        <main className="user-repositories">
          <h2>Repositories</h2>
          <div className="search-box mb-3">
            <input
              type="text"
              className="form-control"
              value={searchQuery}
              placeholder="Search repositories..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.length > 0 ? (
            searchResults.map((repo) => (
              <div
                key={repo._id}
                className="repo-item mb-3 p-3 border rounded shadow-sm"
                onClick={() => handleRepoClick(repo._id)}  // Ensure click event is attached
                style={{ cursor: "pointer" }}  // Ensure it's clickable
              >
                <h5>{repo.name}</h5>
                <p>{repo.description}</p>
                <button
                  className="btn btn-primary me-2"
                  onClick={(e) => handleButtonClick(e, repo._id, "update")}
                >
                  Update
                </button>
                <button
                  className="btn btn-danger"
                  onClick={(e) => handleButtonClick(e, repo._id, "delete")}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No repositories found.</p>
          )}

          {/* Update Repository Modal */}
          {repoToUpdate && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Update Repository</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setRepoToUpdate(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="repoName" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="repoName"
                        value={updateName}
                        onChange={(e) => setUpdateName(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="repoDescription" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="repoDescription"
                        rows="3"
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setRepoToUpdate(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleUpdate}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Upcoming Events Section */}
        <aside className="upcoming-events">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Upcoming Events</h5>
              <ul className="list-unstyled">
                <li><p>Tech Conference - Dec 15</p></li>
                <li><p>Developer Meetup - Dec 25</p></li>
                <li><p>React Summit - Jan 5</p></li>
              </ul>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;

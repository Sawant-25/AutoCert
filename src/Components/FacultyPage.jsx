import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FacultyPage.css";

const FacultyPage = () => {
  const [requests, setRequests] = useState([]);
  const [forwarding, setForwarding] = useState({});
  const [rejectionReason, setRejectionReason] = useState({}); // Track rejection reason for each request

  const facultyEmail = localStorage.getItem("userEmail");
  const [authorityEmails, setAuthorityEmails] = useState([]);

  useEffect(() => {
    if (!facultyEmail) return;

    axios
      .get(`http://localhost:5000/api/requests/faculty/${facultyEmail}`)
      .then((res) => {
        console.log("Fetched Requests:", res.data);
        setRequests(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setRequests([]);
      });
    // Fetch authority emails for dropdown
    axios
      .get("http://localhost:5000/api/requests/authority-emails")
      .then((res) => {
        console.log("Fetched authority emails:", res.data.authorityEmails); // <-- Debug log

        setAuthorityEmails(res.data.authorityEmails  || []);
      })
      .catch((err) => {
        console.error("Error fetching authority emails:", err);
      });
  }, [facultyEmail]);

  const handleForward = async (requestId) => {
    const authorityEmail = forwarding[requestId];
    if (!authorityEmail) {
      alert("Please enter authority email before forwarding.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/requests/faculty/approve", {
        requestId,
        authority_email: authorityEmail,
      });

      alert("Request forwarded to authority.");
      // Refresh the list after update
      const res = await axios.get(
        `http://localhost:5000/api/requests/faculty/${facultyEmail}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Error forwarding request:", err);
    }
  };

  const handleReject = async (requestId) => {
    const reason = rejectionReason[requestId];
    if (!reason) {
      alert("Please provide a rejection reason.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/requests/faculty/reject", {
        requestId,
        reason,
      });

      alert("Request rejected.");
      // Refresh the list after update
      const res = await axios.get(
        `http://localhost:5000/api/requests/faculty/${facultyEmail}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };
  const handleInputChange = (e, requestId) => {
    setForwarding((prev) => ({ ...prev, [requestId]: e.target.value }));
  };

  const handleRejectionReasonChange = (e, requestId) => {
    setRejectionReason((prev) => ({
      ...prev,
      [requestId]: e.target.value,
    }));
  };

  return (
    <div className="faculty-dashboard">
      <h2>Faculty Dashboard</h2>
      {requests.length === 0 ? (
        <p>No requests assigned to you.</p>
      ) : (
        requests.map((req) => (
          <div className="request-card" key={req.id}>
            <p>
              <strong>Event:</strong> {req.event_name}
            </p>
            <p>
              <strong>Date:</strong> {req.event_date}
            </p>
            <p>
              <strong>From:</strong> {req.student_email}
            </p>
            <p>
              <strong>Status:</strong> {req.faculty_status}
            </p>

            {req.faculty_status === "Pending" && (
              <>
                <select
                  value={forwarding[req.id] || ""}
                  onChange={(e) => handleInputChange(e, req.id)}
                >
                  <option value="">Select Authority Email</option>
                  {(authorityEmails).map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleForward(req.id)}>
                  Forward to Authority
                </button>
                {/* Reject Button and Rejection Reason Input */}
                <div>
                  <textarea
                    placeholder="Enter rejection reason"
                    value={rejectionReason[req.id] || ""}
                    onChange={(e) => handleRejectionReasonChange(e, req.id)}
                  ></textarea>
                </div>
                <button onClick={() => handleReject(req.id)}>
                  Reject Request
                </button>
              </>
            )}

            {req.faculty_status === "Approved" && (
              <p className="approved">
                Forwarded to Authority: {req.authority_email}
              </p>
            )}

            {req.faculty_status === "Rejected" && (
              <p className="rejected">Request Rejected</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FacultyPage;

// import React from 'react'

// const StudentPage = () => {
//   return (
//     <div>
//       <h1>Student Dashboard</h1>
//     </div>
//   )
// }

// export default StudentPage
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentPage.css"; // for custom styles

const StudentPage = () => {
  const studentEmail = localStorage.getItem("userEmail");
  const studentId = localStorage.getItem("userId");
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    text: "",
    event_name: "",
    event_date: "",
  });
  const [loading, setLoading] = useState(false); // For loading indicator in the email section

  const [requests, setRequests] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const fetchRequests = async () => {
    try {
      console.log("Fetching for email:", studentEmail);
      const response = await axios.get(
        `http://localhost:5000/api/requests/${studentEmail}`
      );
      // console.log("Fetched requests data:", response.data);
      setRequests({
        pending: response.data.filter((req) => req.status === "Pending"),
        approved: response.data.filter((req) => req.status === "Approved"),
        rejected: response.data.filter((req) => req.status === "Rejected"),
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert("Failed to fetch requests.");
    }
  };
  const [facultyEmails, setFacultyEmails] = useState([]);
  const fetchFacultyEmails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/requests/faculty-emails"
      );
      console.log("Response from backend:", response.data);
      const emails = response.data.facultyEmails;

      if (Array.isArray(emails)) {
        setFacultyEmails(emails);
      } else {
        console.warn("facultyEmails not an array:", emails);
        setFacultyEmails([]);
      }
      // setFacultyEmails(response.data.facultyEmails); // Store faculty emails
    } catch (err) {
      console.error("Error fetching faculty emails:", err);
      alert("Failed to fetch faculty emails.");
      setFacultyEmails([]);
    }
  };
  // Fetch requests when the component is mounted
  useEffect(() => {
    if (studentEmail) {
      fetchRequests();
      fetchFacultyEmails(); // Fetch faculty emails when component mounts
    }
  }, [studentEmail]); // Run only when studentId changes

  const handleChange = (e) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // await axios.post('http://localhost:5000/api/send-email', emailData);
      await axios.post("http://localhost:5000/api/send-email", {
        student_email: studentEmail,
        faculty_email: emailData.to,
        subject: emailData.subject,
        message: emailData.text,
        event_name: emailData.event_name,
        event_date: emailData.event_date,
        fromRole: "volunteer",
      });

      alert("Request sent to faculty!");
      setEmailData({ to: "", subject: "", text: "" });
      fetchRequests();
    } catch (err) {
      // console.error('Failed to send email:', err);
      // console.error('Email error:', err);
      alert("Failed to send request");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const resendRequest = async (requestId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/resend-request', {
        requestId,
        faculty_email: requests.rejected.find(req => req.id === requestId).faculty_email,
      });

      if (response.status === 200) {
        alert('Request resent successfully!');
        fetchRequests();  // Refresh the requests list to reflect the changes
      }
    } catch (err) {
      alert('Failed to resend request');
      console.error('Error resending request:', err);
    }
  };
  return (
    <div className="student-container">
      <div className="left-pane">
        <h3>Your Requests</h3>
        <div class="requests-area">
          <div className="request-row">
            <div className="request-category pending-category">
              <h4>Pending</h4>

              {requests.pending.length > 0 ? (
                <ul>
                  {/* CHANGED: Mapping now renders more details */}
                  {requests.pending.map((req) => (
                    // ADDED: key, className, and detailed structure
                    <li key={req.id} className="request-item">
                      <strong className="request-subject">{req.subject}</strong>
                      <span className="request-detail">
                        To: {req.faculty_email}
                      </span>
                      <span className="request-detail">
                        Sent: {formatDate(req.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                // ADDED: Specific message for no requests
                <p className="no-requests">No pending requests.</p>
              )}
            </div>
            <div className="request-category approved-category">
              <h4>Approved</h4>
              {requests.approved.length > 0 ? (
                <ul>
                  {/* CHANGED: Mapping now renders more details */}
                  {requests.approved.map((req) => (
                    // ADDED: key, className, and detailed structure
                    <li
                      key={req.id}
                      className="request-item request-item-approved"
                    >
                      <strong className="request-subject">{req.subject}</strong>
                      <span className="request-detail">
                        To: {req.faculty_email}
                      </span>
                      <span className="request-detail">
                        Approved: {formatDate(req.updated_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                // ADDED: Specific message for no requests
                <p className="no-requests">No approved requests.</p>
              )}
            </div>
          </div>
          <div className="request-category rejected-category">
            <h4>Rejected</h4>
            {requests.rejected.length > 0 ? (
              <ul>
                {/* CHANGED: Mapping now renders more details */}
                {requests.rejected.map((req) => (
                  // ADDED: key, className, and detailed structure
                  <li
                    key={req.id}
                    className="request-item request-item-rejected"
                  >
                    <strong className="request-subject">{req.subject}</strong>
                    <span className="request-detail">
                      To: {req.faculty_email}
                    </span>
                    <span className="request-detail">
                      Rejected: {formatDate(req.updated_at)}
                    </span>
                    {/* Displaying rejection reason */}
                    {req.rejection_reason && (
                      <span className="rejection-reason">
                        <strong>Reason: </strong>
                        {req.rejection_reason}
                      </span>
                    )}
                    <button onClick={() => resendRequest(req.id)} className="resend-button">Resend</button>
                  </li>
                ))}
              </ul>
            ) : (
              // ADDED: Specific message for no requests
              <p className="no-requests">No rejected requests.</p>
            )}
          </div>
        </div>
      </div>
      <div className="right-pane">
        <h2>Send Request to Faculty</h2>
        <form onSubmit={handleSend}>
          {/* <input
            type="email"
            name="to"
            placeholder="Faculty Email"
            value={emailData.to}
            onChange={handleChange}
            required
          /> */}
          <select
            name="to"
            value={emailData.to}
            onChange={handleChange}
            required
          >
            <option value="">Select Faculty Email</option>
            {Array.isArray(facultyEmails) &&
              facultyEmails.map((email, index) => (
                <option key={index} value={email}>
                  {email}
                </option>
              ))}
          </select>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={emailData.subject}
            onChange={handleChange}
            required
          />
          <textarea
            name="text"
            placeholder="Message..."
            rows={5}
            value={emailData.text}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="event_name"
            placeholder="Event Name"
            value={emailData.event_name}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="event_date"
            placeholder="Event Date"
            value={emailData.event_date}
            onChange={handleChange}
            required
          />

          <button type="submit">Send Request</button>
        </form>
      </div>
    </div>
  );
};

export default StudentPage;

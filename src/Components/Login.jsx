import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import './Login.css';

function Login() {
  // console.log("login component rendered")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm();
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        alert(result.message || 'Login failed');
        return;
      }
  
      // Save user data locally (for later use in dashboard)
      localStorage.setItem('userId', result.user.id);
      localStorage.setItem('role', result.user.role);
      localStorage.setItem('userEmail',result.user.email);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("Form submitted:", data);
   
    if (data.role === "student") {
      navigate("/home/student"); // ← Adjust the route as per your route structure
    } else if (data.role === "faculty") {
      navigate("/home/faculty");
    } else if (data.role === "higher_authority") {
      navigate("/home/higher-authority");
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Something went wrong');
  }


    reset();
  }

  return (
       // This container handles page layout below navbar
       <div className="login-page-container">
       {/* This container is the visible styled box */}
       <div className="login-form-box">
          
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          className={errors.username ? "input-error" : ""}
          {...register("username", {
            required: "Username is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
            maxLength: { value: 15, message: "Maximum 15 characters" },
            pattern: { value: /^[A-Za-z]+$/i, message: "Only letters allowed" }
          })}
        />
        {errors.username && <p className="error-msg">{errors.username.message}</p>}
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
            maxLength: { value: 8, message: "Maximum 8 characters" }
          })}
        />
        {errors.password && <p className="error-msg">{errors.password.message}</p>}
      </div>

      <div>
        <label>Role:</label>
        <select {...register("role", { required: "Role is required" })}>
          <option value="">-- Select Role --</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty Coordinator</option>
          <option value="higher_authority">Higher Authority</option>
        </select>
        {errors.role && <p className="error-msg">{errors.role.message}</p>}
      </div>

      <input type="submit" disabled={isSubmitting} value={isSubmitting ? "Processing" : "Login"} />
    </form>
    </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from './services/userService';
import { Container, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, IconButton, InputAdornment, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '@fortawesome/fontawesome-free/css/all.min.css';

const category = [
  'Creative', 'Host', 'Planner', 'Vendor'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    gender: '',
    category: '',
    password: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain both letters and numbers';
    }
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms and conditions';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      setError('');
      setLoading(true);
      try {
        await signup(formData);
        alert('User signed up successfully');
        navigate('/login');
      } catch (error) {
        console.error('Error signing up:', error);
        setError(error.response?.data?.message || 'Error signing up');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Signup</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            error={!!errors.gender}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                maxWidth: '90vw',
                overflow: 'hidden'
              }
            }}
          >
            <MenuItem value=""><em>Select Gender</em></MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {errors.gender && <Typography color="error">{errors.gender}</Typography>}
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={!!errors.category}
          >
            <MenuItem value=""><em>Select Category</em></MenuItem>
            {category.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
          {errors.category && <Typography color="error">{errors.category}</Typography>}
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={<Checkbox checked={formData.agreedToTerms} onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })} />}
          label={<Typography> I agree to the <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setTermsOpen(true)}>Terms and Conditions</span></Typography>}
        />
        {error.agreedToTerms && <Typography color="error">{error.agreedToTerms}</Typography>}
        <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Signup'}
        </Button>
      </form>
      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)}>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogContent>
        <p>**USER AGREEMENT** <br></br> 
*Effective Date: [Insert Date]* <br></br> 

Welcome to FunPlug, an event management platform that facilitates ticket sales and venue bookings. By accessing or using our services, you agree to comply with the following terms and conditions. Please read this agreement carefully.
<br></br>
---
<br></br>
<p><strong>1. Introduction</strong><br></br>
This User Agreement ("Agreement") governs your use of the FunPlug platform. By creating an account and using our services, you acknowledge and agree to be bound by these terms. If you do not agree, you must discontinue use of the platform immediately.
</p>

<p><strong>2. User Accounts & Responsibilities</strong>
  <ol>
    <li> You must be at least 18 years old to create an account.</li>
    <li> You are responsible for providing accurate and up-to-date information.</li>
    <li> You agree not to share your account credentials or allow unauthorized access.</li>
    <li> Prohibited activities include fraud, abuse, or any unlawful use of the platform.</li>
    </ol>
</p>
 
<p><strong>3. Event & Ticketing Policies</strong>
  <ol>
    <li> Event organizers are responsible for setting ticket prices and managing event details.</li>
    <li> Users purchasing tickets must ensure all details are correct before completing transactions.</li>
    <li> Refund policies are determined by the event organizer and must be clearly stated on the event page.</li>
    <li> The platform is not responsible for event cancellations, delays, or changes.</li>
    </ol>
</p>

<p><strong>4. Venue Booking Policies</strong>
<ol>
    <li> Users booking venues must adhere to the venue's terms and conditions.</li>
    <li> Bookings may require payment upfront, subject to refund and cancellation policies.</li>
    <li> Users are responsible for any damages or breaches of venue policies during the booking period.</li>
    </ol>
</p>

<p><strong>5. Payment Processing & Fees</strong>
<ol>
    <li> The platform supports multiple payment methods for ticket purchases and venue bookings.</li>
    <li> Service fees may apply and will be clearly disclosed before payment.</li>
    <li> Refunds are subject to the policies set by event organizers or venue providers.</li>
    </ol>
</p>

<p><strong>6. Cancellations & Refunds</strong>
  <ol>
    <li> Event cancellations are the responsibility of the event organizer.</li>
    <li> Venue cancellations are subject to the venue provider’s terms.</li>
    <li> Refund requests must be submitted within the stated timeframe and are subject to approval.</li>
  </ol>
</p>

<p><strong>7. User Conduct & Community Guidelines</strong>
  <ol>
    <li> Users must respect community guidelines and refrain from harassment or disruptive behavior.</li>
    <li> Misrepresentation of events or venues is strictly prohibited.</li>
    <li> The platform reserves the right to remove content or suspend accounts violating these policies.</li>
  </ol>
</p>

<p><strong>8. Content Ownership & Intellectual Property</strong>
  <ol>
    <li> Users retain ownership of the content they upload but grant the platform a license to use it for promotional purposes.</li>
    <li> Unauthorized use of copyrighted materials is prohibited.</li>
  </ol>
</p>

<p><strong>9. Privacy & Data Protection</strong>
  <ol>
    <li> User data is collected, stored, and protected per our [Privacy Policy].</li>
    <li> The platform may share data with third-party services for payment processing and analytics.</li>
  </ol>
</p>

<p><strong>10. Dispute Resolution</strong>
  <ol>
    <li> Disputes between users should be resolved amicably. If not, the platform may mediate but is not liable for user disputes.</li>
    <li> Legal disputes related to transactions will be handled under the applicable governing law.</li>
  </ol>
</p>

<p><strong>11. Termination & Account Suspension</strong>
  <ol>
    <li> The platform reserves the right to suspend or terminate accounts for policy violations.</li>
    <li> Users may appeal account suspensions by contacting customer support.</li>
  </ol>
</p>

<p><strong>12. Limitation of Liability</strong>
  <ol>
    <li> The platform is not liable for any losses arising from canceled events, incorrect bookings, or technical issues.</li>
    <li> Users acknowledge they assume the risks associated with attending events and booking venues.</li>
  </ol>
</p>

<p><strong>13. Modifications to the Agreement</strong>
  <ol>
    <li> The platform may update this Agreement from time to time. Users will be notified of significant changes.</li>
    <li> Continued use of the platform after changes take effect constitutes acceptance of the new terms.</li>
  </ol>
</p>

<p><strong>14. Governing Law & Jurisdiction</strong>
  <ol>
    <li> This Agreement shall be governed by the laws of The Republic of Kenya.</li>
    <li> Any legal disputes shall be resolved in the courts of The Republic of Kenya.</li>
  </ol>
</p>

By using FunPlug, you agree to these terms. If you have any questions, contact us at [Support Email].

</p>

        </DialogContent>
        <DialogActions>
          <Button variant="contained" sx={{ display: 'block', margin: '20px auto' }} onClick={() => setTermsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Signup;


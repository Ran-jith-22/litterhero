import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  BarChart2, 
  Upload, 
  Compass,
  ArrowRight
} from 'lucide-react';

export function ReportPage({ setActivePage }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plastic',
    severity: 'medium',
    location: '',
    latitude: '',
    longitude: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Live client-side explainable score preview
  const previewScore = useMemo(() => {
    let base = 20;
    if (formData.severity === 'critical') base = 40;
    else if (formData.severity === 'high') base = 32;
    else if (formData.severity === 'medium') base = 20;
    else if (formData.severity === 'low') base = 10;

    let catScore = 15;
    if (formData.category === 'hazardous') catScore = 30;
    else if (formData.category === 'plastic') catScore = 25;
    else if (formData.category === 'mixed') catScore = 18;
    else if (formData.category === 'food') catScore = 12;
    else if (formData.category === 'paper') catScore = 8;

    return Math.min(100, base + catScore + 10);
  }, [formData.severity, formData.category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          location: prev.location || `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
        }));
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback demo coordinates
        setFormData(prev => ({
          ...prev,
          latitude: '47.6062',
          longitude: '-122.3321',
          location: prev.location || 'Metropolitan Community Park, Sector 4'
        }));
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.location.trim()) {
      setErrorMsg('Please specify the location or landmark of the litter hotspot.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedPhotoUrl = photoPreview;

      // If a real image file was selected, upload via API
      if (photoFile) {
        try {
          const uploadRes = await api.uploadImage(photoFile);
          uploadedPhotoUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Backend image upload fallback to preview data:', uploadErr);
        }
      }

      const res = await api.createReport({
        title: formData.title || `${formData.category.toUpperCase()} Debris Hotspot`,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        photoUrl: uploadedPhotoUrl
      });

      setSuccessResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '820px' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-leaf-dark)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <Sparkles size={16} /> First Step of the Verified Impact Loop
        </div>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest-dark)', marginTop: '0.25rem' }}>
          Report a Litter Hotspot
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Spot it. Report it. Submitting this report automatically activates a community cleanup mission with an explainable priority score.
        </p>
      </div>

      {successResult ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', background: '#f0fdf4', borderColor: '#a7f3d0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <CheckCircle2 size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#065f46', marginBottom: '0.5rem' }}>
            Hotspot Registered Successfully!
          </h2>
          <p style={{ color: '#047857', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Report ID <strong>{successResult.report.id}</strong> has been verified and registered in the database.
          </p>

          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', maxWidth: '500px', margin: '0 auto 2rem auto', border: '1px solid #d1fae5', textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Created Mission Summary:
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{successResult.mission.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📍 {successResult.mission.location}</div>
            <div className="flex items-center gap-2">
              <span className="badge badge-purple">Score: {successResult.mission.priorityScore}/100</span>
              <span className="badge badge-emerald">Reward: ⭐ {successResult.mission.rewardPoints} pts</span>
              <span className="badge badge-blue">Status: AVAILABLE</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setSuccessResult(null); setPhotoPreview(null); }}
              className="btn btn-secondary"
            >
              Submit Another Hotspot
            </button>
            <button
              onClick={() => setActivePage('missions')}
              className="btn btn-primary"
            >
              View in Mission Explorer
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.25rem' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Report Title or Landmark Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Plastic debris accumulation along Mill Creek Trail"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Waste Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="plastic">Plastic &amp; Synthetic Packaging (High Persistence)</option>
                <option value="paper">Paper &amp; Cardboard</option>
                <option value="food">Food Waste &amp; Organics</option>
                <option value="mixed">Mixed Solid Waste</option>
                <option value="hazardous">Hazardous / Chemical / Glass</option>
                <option value="other">Other Debris</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level *</label>
              <select
                className="form-select"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                required
              >
                <option value="low">Low (Light loose litter, &lt; 1 bag)</option>
                <option value="medium">Medium (Scattered debris, 1-3 bags)</option>
                <option value="high">High (Heavy accumulation, 4-10 bags)</option>
                <option value="critical">Critical (Environmental emergency / illegal dump)</option>
              </select>
            </div>
          </div>

          {/* Location & GPS */}
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Location / Street / Trail Landmark *</label>
              <button
                type="button"
                onClick={handleGetLocation}
                style={{ fontSize: '0.78rem', color: 'var(--color-leaf-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Compass size={14} /> Auto-detect GPS
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Riverside Park, near North Footbridge entrance"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Latitude (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 47.6062"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Longitude (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. -122.3321"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe the nature of the waste, quantity estimate, accessibility, and any safety hazards."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Photo Upload with Preview */}
          <div className="form-group">
            <label className="form-label">Hotspot Evidence Photo (Before Cleanup)</label>
            <div style={{ border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-card-muted)' }}>
              {photoPreview ? (
                <div>
                  <img
                    src={photoPreview}
                    alt="Before hotspot preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius-md)', margin: '0 auto 1rem auto', display: 'block', objectFit: 'cover' }}
                  />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={14} /> Change Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                </div>
              ) : (
                <div>
                  <Camera size={36} color="var(--color-leaf-dark)" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.25rem' }}>
                    Upload Before-Cleanup Photo
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                    PNG, JPG, or WEBP up to 10MB. Visual proof establishes baseline for admin verification.
                  </p>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={14} /> Select File
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Live Explainable Priority Score Preview Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.75rem' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} color="#2563eb" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  Live Explainable Priority Preview:
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>
                {previewScore} / 100
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
              Estimated reward for this mission: <strong>~{Math.round(previewScore * 1.5)} impact points</strong> upon admin approval.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            disabled={isSubmitting}
          >
            <Send size={18} />
            {isSubmitting ? 'Registering Hotspot & Generating Mission...' : 'Submit Hotspot Report'}
          </button>
        </form>
      )}
    </div>
  );
}

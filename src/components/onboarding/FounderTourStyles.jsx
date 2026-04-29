/* Premiso Founder Tour — Shepherd.js overrides */

.shepherd-modal-overlay-container {
  z-index: 9000;
}

.shepherd-element {
  z-index: 9100;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  max-width: 360px;
}

.shepherd-has-title .shepherd-content .shepherd-header {
  background: hsl(221, 55%, 20%);
  border-radius: 12px 12px 0 0;
  padding: 16px 20px 12px;
}

.shepherd-has-title .shepherd-content .shepherd-title {
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.shepherd-cancel-icon {
  color: rgba(255,255,255,0.6) !important;
}
.shepherd-cancel-icon:hover {
  color: #fff !important;
}

.shepherd-text {
  padding: 16px 20px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #374151;
  font-family: 'Inter', sans-serif;
}

.shepherd-footer {
  padding: 0 20px 16px;
  gap: 8px;
  display: flex;
  justify-content: flex-end;
}

.shepherd-button {
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Inter', sans-serif;
  border: none;
}

.shepherd-button-primary {
  background: hsl(221, 65%, 28%);
  color: #fff;
}
.shepherd-button-primary:hover {
  background: hsl(221, 65%, 23%);
}

.shepherd-button-secondary {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb !important;
}
.shepherd-button-secondary:hover {
  background: #f9fafb;
  color: #374151;
}

/* Step counter badge in top-right */
.shepherd-progress {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  margin-left: auto;
  font-family: 'Inter', sans-serif;
}

/* Arrow */
.shepherd-arrow:before {
  background: white;
}

.shepherd-element[data-popper-placement^='bottom'] .shepherd-arrow:before {
  background: hsl(221, 55%, 20%);
}
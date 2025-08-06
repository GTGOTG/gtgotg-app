// GTGOTG - Enhanced Review System with Photo Upload
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('📷 GTGOTG - Photo Upload & Enhanced Review System - Loading...');

// Photo upload configuration
const PHOTO_CONFIG = {
    maxFiles: 3,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
};

// Global variables for review system
let selectedPhotos = [];
let selectedBathroomType = null;
let isWheelchairAccessible = false;
let currentRatings = {
    overall: 0,
    cleanliness: 0,
    safety: 0,
    accessibility: 0
};

// Initialize enhanced review system
function initializeEnhancedReviewSystem() {
    console.log('🔧 Initializing enhanced review system...');
    
    // Initialize photo upload functionality
    initializePhotoUpload();
    
    // Initialize bathroom symbol selection
    initializeBathroomSymbols();
    
    // Initialize enhanced star ratings
    initializeEnhancedRatings();
    
    // Initialize form validation
    initializeFormValidation();
    
    console.log('✅ Enhanced review system initialized');
}

// Initialize photo upload functionality
function initializePhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    const uploadDropzone = document.querySelector('.upload-dropzone');
    
    if (!photoUpload || !uploadDropzone) {
        console.log('Photo upload elements not found');
        return;
    }
    
    // File input change handler
    photoUpload.addEventListener('change', handleFileSelection);
    
    // Drag and drop handlers
    uploadDropzone.addEventListener('dragover', handleDragOver);
    uploadDropzone.addEventListener('dragleave', handleDragLeave);
    uploadDropzone.addEventListener('drop', handleFileDrop);
    
    // Click handler for dropzone
    uploadDropzone.addEventListener('click', () => {
        photoUpload.click();
    });
    
    console.log('📷 Photo upload initialized');
}

// Handle file selection
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    processSelectedFiles(files);
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
}

// Handle file drop
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    processSelectedFiles(files);
}

// Process selected files
function processSelectedFiles(files) {
    console.log(`📁 Processing ${files.length} selected files...`);
    
    // Filter valid image files
    const validFiles = files.filter(file => {
        if (!PHOTO_CONFIG.allowedTypes.includes(file.type)) {
            showNotification(`File "${file.name}" is not a supported image format.`, 'warning');
            return false;
        }
        
        if (file.size > PHOTO_CONFIG.maxFileSize) {
            showNotification(`File "${file.name}" is too large. Maximum size is 5MB.`, 'warning');
            return false;
        }
        
        return true;
    });
    
    // Check total file limit
    if (selectedPhotos.length + validFiles.length > PHOTO_CONFIG.maxFiles) {
        const remaining = PHOTO_CONFIG.maxFiles - selectedPhotos.length;
        showNotification(`You can only upload ${PHOTO_CONFIG.maxFiles} photos total. ${remaining} slots remaining.`, 'warning');
        validFiles.splice(remaining);
    }
    
    // Add valid files to selection
    validFiles.forEach(file => {
        addPhotoToSelection(file);
    });
    
    // Update preview
    updatePhotoPreview();
    
    console.log(`✅ Added ${validFiles.length} photos to selection`);
}

// Add photo to selection
function addPhotoToSelection(file) {
    const photoData = {
        file: file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
    };
    
    selectedPhotos.push(photoData);
}

// Update photo preview
function updatePhotoPreview() {
    const previewContainer = document.getElementById('photoPreview');
    const previewList = document.getElementById('photoPreviewList');
    
    if (!previewContainer || !previewList) return;
    
    if (selectedPhotos.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'block';
    previewList.innerHTML = '';
    
    selectedPhotos.forEach(photo => {
        const previewItem = createPhotoPreviewItem(photo);
        previewList.appendChild(previewItem);
    });
}

// Create photo preview item
function createPhotoPreviewItem(photo) {
    const item = document.createElement('div');
    item.className = 'photo-preview-item';
    item.innerHTML = `
        <img src="${photo.url}" alt="${photo.name}" class="photo-preview-img">
        <div class="photo-preview-info">
            <div class="photo-filename">${photo.name}</div>
            <div class="photo-size">${formatFileSize(photo.size)}</div>
        </div>
        <button type="button" class="photo-remove" onclick="removePhoto('${photo.id}')">×</button>
    `;
    
    return item;
}

// Remove photo from selection
function removePhoto(photoId) {
    const index = selectedPhotos.findIndex(photo => photo.id == photoId);
    if (index !== -1) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(selectedPhotos[index].url);
        selectedPhotos.splice(index, 1);
        updatePhotoPreview();
        
        console.log(`🗑️ Removed photo from selection`);
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize bathroom symbol selection
function initializeBathroomSymbols() {
    const bathroomBtns = document.querySelectorAll('.bathroom-symbol-btn');
    const wheelchairBtn = document.querySelector('.wheelchair-btn');
    
    // Bathroom type selection
    bathroomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all buttons
            bathroomBtns.forEach(b => b.classList.remove('selected'));
            
            // Add selected class to clicked button
            btn.classList.add('selected');
            
            // Store selected type
            selectedBathroomType = btn.dataset.type;
            
            console.log(`🚻 Selected bathroom type: ${selectedBathroomType}`);
        });
    });
    
    // Wheelchair accessibility selection
    if (wheelchairBtn) {
        wheelchairBtn.addEventListener('click', () => {
            isWheelchairAccessible = !isWheelchairAccessible;
            wheelchairBtn.classList.toggle('selected', isWheelchairAccessible);
            wheelchairBtn.dataset.accessible = isWheelchairAccessible;
            
            console.log(`♿ Wheelchair accessible: ${isWheelchairAccessible}`);
        });
    }
    
    console.log('🚻 Bathroom symbol selection initialized');
}

// Initialize enhanced star ratings
function initializeEnhancedRatings() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const ratingType = rating.dataset.rating;
        const stars = rating.querySelectorAll('.star');
        const display = document.getElementById(`${ratingType}RatingDisplay`);
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                setRating(ratingType, value, stars, display);
            });
            
            star.addEventListener('mouseenter', () => {
                highlightStars(stars, parseInt(star.dataset.value));
            });
        });
        
        rating.addEventListener('mouseleave', () => {
            highlightStars(stars, currentRatings[ratingType] || 0);
        });
    });
    
    console.log('⭐ Enhanced star ratings initialized');
}

// Set rating value
function setRating(type, value, stars, display) {
    currentRatings[type] = value;
    highlightStars(stars, value);
    
    if (display) {
        display.textContent = `${value}/10`;
    }
    
    console.log(`⭐ Set ${type} rating to ${value}/10`);
}

// Highlight stars up to value
function highlightStars(stars, value) {
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Initialize form validation
function initializeFormValidation() {
    const reviewForm = document.getElementById('reviewForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }
    
    console.log('✅ Form validation initialized');
}

// Handle review submission
async function handleReviewSubmission(event) {
    event.preventDefault();
    
    console.log('📝 Submitting review...');
    
    // Validate required fields
    if (!validateReviewForm()) {
        return;
    }
    
    // Prepare review data
    const reviewData = prepareReviewData();
    
    // Show loading state
    showLoadingState(true);
    
    try {
        // Simulate photo upload and review submission
        await submitReviewWithPhotos(reviewData);
        
        // Show success message
        showNotification('Review submitted successfully! Thank you for helping others find great restrooms.', 'success');
        
        // Update business data
        updateBusinessWithReview(reviewData);
        
        // Close modal and reset form
        closeModal('reviewModal');
        resetReviewForm();
        
        // Update user badge if logged in
        if (currentUser) {
            updateUserBadge();
        }
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Error submitting review. Please try again.', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Validate review form
function validateReviewForm() {
    // Check if at least overall rating is provided
    if (currentRatings.overall === 0) {
        showNotification('Please provide at least an overall rating.', 'warning');
        return false;
    }
    
    // Check if bathroom type is selected
    if (!selectedBathroomType) {
        showNotification('Please select which bathroom you used.', 'warning');
        return false;
    }
    
    // Validate photos if any
    if (selectedPhotos.length > 0) {
        for (const photo of selectedPhotos) {
            if (photo.size > PHOTO_CONFIG.maxFileSize) {
                showNotification(`Photo "${photo.name}" is too large.`, 'warning');
                return false;
            }
        }
    }
    
    return true;
}

// Prepare review data
function prepareReviewData() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    
    const reviewData = {
        businessId: currentBusinessForReview,
        userId: currentUser ? currentUser.id : null,
        ratings: { ...currentRatings },
        bathroomType: selectedBathroomType,
        wheelchairAccessible: isWheelchairAccessible,
        amenities: [],
        comment: formData.get('comment') || '',
        photos: selectedPhotos,
        timestamp: new Date().toISOString(),
        anonymous: !currentUser
    };
    
    // Get selected amenities
    const amenityCheckboxes = form.querySelectorAll('input[name="amenities"]:checked');
    reviewData.amenities = Array.from(amenityCheckboxes).map(cb => cb.value);
    
    return reviewData;
}

// Submit review with photos
async function submitReviewWithPhotos(reviewData) {
    console.log('📤 Submitting review with photos...');
    
    // Simulate photo upload process
    if (reviewData.photos.length > 0) {
        for (let i = 0; i < reviewData.photos.length; i++) {
            const photo = reviewData.photos[i];
            console.log(`📷 Uploading photo ${i + 1}/${reviewData.photos.length}: ${photo.name}`);
            
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // In a real implementation, you would upload to a server here
            // For now, we'll just store the photo data locally
            photo.uploadedUrl = `uploads/reviews/${reviewData.businessId}/${photo.id}.${photo.type.split('/')[1]}`;
        }
    }
    
    // Store review data (in a real app, this would go to a server)
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    reviews.push(reviewData);
    localStorage.setItem('gtgotg_reviews', JSON.stringify(reviews));
    
    console.log('✅ Review submitted successfully');
}

// Update business with new review
function updateBusinessWithReview(reviewData) {
    const business = sampleBusinesses.find(b => b.id === reviewData.businessId);
    if (!business) return;
    
    // Update review count
    business.reviewCount = (business.reviewCount || 0) + 1;
    
    // Update ratings (simple average for demo)
    const totalReviews = business.reviewCount;
    Object.keys(reviewData.ratings).forEach(key => {
        if (reviewData.ratings[key] > 0) {
            const currentRating = business.ratings[key] || 0;
            const newRating = reviewData.ratings[key];
            business.ratings[key] = ((currentRating * (totalReviews - 1)) + newRating) / totalReviews;
        }
    });
    
    // Update amenities based on review
    if (reviewData.amenities.length > 0) {
        business.amenities = [...new Set([...business.amenities, ...reviewData.amenities])];
    }
    
    // Update bathroom types
    if (reviewData.bathroomType && !business.bathroomTypes.includes(reviewData.bathroomType)) {
        business.bathroomTypes.push(reviewData.bathroomType);
    }
    
    if (reviewData.wheelchairAccessible && !business.bathroomTypes.includes('accessible')) {
        business.bathroomTypes.push('accessible');
    }
    
    // Re-render the business card
    renderBusinesses(currentBusinesses);
    
    console.log('🔄 Business data updated with new review');
}

// Reset review form
function resetReviewForm() {
    // Reset ratings
    currentRatings = {
        overall: 0,
        cleanliness: 0,
        safety: 0,
        accessibility: 0
    };
    
    // Reset rating displays
    Object.keys(currentRatings).forEach(type => {
        const display = document.getElementById(`${type}RatingDisplay`);
        if (display) display.textContent = '0/10';
        
        const stars = document.querySelectorAll(`[data-rating="${type}"] .star`);
        stars.forEach(star => star.classList.remove('active'));
    });
    
    // Reset bathroom selection
    selectedBathroomType = null;
    isWheelchairAccessible = false;
    
    document.querySelectorAll('.bathroom-symbol-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const wheelchairBtn = document.querySelector('.wheelchair-btn');
    if (wheelchairBtn) {
        wheelchairBtn.classList.remove('selected');
        wheelchairBtn.dataset.accessible = 'false';
    }
    
    // Reset photos
    selectedPhotos.forEach(photo => {
        URL.revokeObjectURL(photo.url);
    });
    selectedPhotos = [];
    updatePhotoPreview();
    
    // Reset form fields
    const form = document.getElementById('reviewForm');
    if (form) {
        form.reset();
    }
    
    console.log('🔄 Review form reset');
}

// Show loading state
function showLoadingState(loading) {
    const submitBtn = document.querySelector('#reviewForm button[type="submit"]');
    const form = document.getElementById('reviewForm');
    
    if (loading) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        if (form) {
            form.classList.add('photo-uploading');
        }
    } else {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
        if (form) {
            form.classList.remove('photo-uploading');
        }
    }
}

// Update user badge after review
function updateUserBadge() {
    if (!currentUser) return;
    
    // Get user's review count
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const userReviews = reviews.filter(r => r.userId === currentUser.id);
    const reviewCount = userReviews.length;
    
    // Update badge based on review count
    let newBadge = 'Reviewer';
    if (reviewCount >= 25) newBadge = 'Expert';
    else if (reviewCount >= 20) newBadge = 'Platinum';
    else if (reviewCount >= 15) newBadge = 'Gold';
    else if (reviewCount >= 10) newBadge = 'Silver';
    else if (reviewCount >= 5) newBadge = 'Bronze';
    
    if (newBadge !== currentUser.badge) {
        currentUser.badge = newBadge;
        updateUserStatus();
        showNotification(`Congratulations! You've earned the ${newBadge} badge!`, 'success');
        
        // Update stored user data
        const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].badge = newBadge;
            localStorage.setItem('gtgotg_users', JSON.stringify(users));
        }
    }
}

// Enhanced openReviewModal function
function openReviewModal(businessId) {
    const business = sampleBusinesses.find(b => b.id === businessId);
    if (!business) return;
    
    currentBusinessForReview = businessId;
    
    // Update modal title
    const titleElement = document.getElementById('businessNameDisplay');
    if (titleElement) {
        titleElement.textContent = `Rate ${business.name}`;
    }
    
    // Reset form
    resetReviewForm();
    
    // Show modal
    showModal('reviewModal');
    
    console.log(`📝 Opened review modal for: ${business.name}`);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Initializing enhanced review system...');
    setTimeout(initializeEnhancedReviewSystem, 500);
});

// Export functions for global use
window.removePhoto = removePhoto;
window.openReviewModal = openReviewModal;

console.log('✅ GTGOTG - Photo Upload & Enhanced Review System - Loaded successfully!');


// Blockchain Connection
let web3;
let votingContract;
const contractAddress = '0x123...'; // Your contract address
const contractABI = []; // Your contract ABI

async function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      votingContract = new web3.eth.Contract(contractABI, contractAddress);
      return true;
    } catch (error) {
      console.error("User denied account access");
      return false;
    }
  } else {
    console.log("No Ethereum browser extension detected");
    return false;
  }
}

// Voting Functionality
async function castVote(candidateId) {
  const accounts = await web3.eth.getAccounts();
  const voterId = sessionStorage.getItem('voterId');
  
  // In a real implementation, sign the transaction with the voter's private key
  const signature = "mock_signature"; 
  
  try {
    await votingContract.methods.castVote(voterId, candidateId, signature)
      .send({ from: accounts[0] });
    alert('Vote successfully recorded on blockchain!');
  } catch (error) {
    console.error('Error casting vote:', error);
    alert('Failed to cast vote');
  }
}

// Blockchain Visualization
function renderBlockchainStatus() {
  const statusElement = document.querySelector('.blockchain-status');
  if (statusElement) {
    setInterval(async () => {
      const blockNumber = await web3.eth.getBlockNumber();
      statusElement.textContent = `Connected to blockchain. Current block: ${blockNumber}`;
    }, 5000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const connected = await initWeb3();
  if (connected) {
    renderBlockchainStatus();
    // Rest of your initialization code
  }
});
// Global variables
let voters = JSON.parse(localStorage.getItem('voters')) || [];
let currentVoter = JSON.parse(sessionStorage.getItem('currentVoter')) || null;

// Initialize voter registration form
function initVoterRegistration() {
    const form = document.getElementById('voterRegistrationForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const spinner = document.getElementById('registrationSpinner');
        const status = document.getElementById('registrationStatus');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
        status.textContent = 'Registering voter on blockchain...';
        status.style.color = 'var(--secondary-color)';

        // Get form values
        const voterPhotoFile = document.getElementById('voterPhoto').files[0];
        const aadharPhotoFile = document.getElementById('aadharPhoto').files[0];
        
        // Read files as Data URLs
        const reader1 = new FileReader();
        const reader2 = new FileReader();
        
        reader1.onload = function(e1) {
            reader2.onload = function(e2) {
                // Create voter object
                const voterData = {
                    id: 'VTR' + Math.floor(10000000 + Math.random() * 90000000),
                    name: document.getElementById('fullName').value,
                    dob: document.getElementById('dob').value,
                    age: document.getElementById('age').value,
                    gender: document.getElementById('gender').value,
                    aadharNumber: document.getElementById('aadharNumber').value,
                    photo: e1.target.result,
                    aadharPhoto: e2.target.result,
                    registeredDate: new Date().toISOString().split('T')[0],
                    hasVoted: false
                };

                // Simulate blockchain registration delay
                setTimeout(() => {
                    // Save to local storage (in real app, this would be a blockchain transaction)
                    voters.push(voterData);
                    localStorage.setItem('voters', JSON.stringify(voters));
                    
                    // Update UI
                    spinner.classList.add('d-none');
                    status.innerHTML = `
                        <div class="alert alert-success">
                            <i class="bi bi-check-circle-fill"></i> 
                            Voter registered successfully!<br>
                            <strong>Voter ID:</strong> ${voterData.id}<br>
                            <a href="voter_login.html" class="btn btn-sm btn-success mt-2">Proceed to Login</a>
                        </div>
                    `;
                    
                    form.reset();
                    document.getElementById('photoPreview').innerHTML = '';
                    document.getElementById('aadharPreview').innerHTML = '';
                }, 2000);
            };
            reader2.readAsDataURL(aadharPhotoFile);
        };
        reader1.readAsDataURL(voterPhotoFile);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    if (path === 'voter_registration.html') {
        initVoterRegistration();
    } else if (path === 'candidate_portal.html') {
        // Any initialization for candidate portal
    }
    // Other page initializations...
});
// Add to script.js
async function registerVoterWithFace(voterData) {
    // In a real implementation, you would:
    // 1. Store the face descriptor in your database
    // 2. Compare with existing descriptors to prevent duplicates
    
    // For demo, we'll use localStorage
    const registeredVoters = JSON.parse(localStorage.getItem('registeredVoters')) || [];
    
    // Check for similar faces (simplified for demo)
    const faceDescriptor = JSON.parse(voterData.faceDescriptor);
    for (const voter of registeredVoters) {
        const existingDescriptor = JSON.parse(voter.faceDescriptor);
        const distance = faceapi.euclideanDistance(faceDescriptor, existingDescriptor);
        
        if (distance < 0.6) { // Threshold for face match
            throw new Error('This face is already registered in our system');
        }
    }
    
    // Add to registered voters
    registeredVoters.push(voterData);
    localStorage.setItem('registeredVoters', JSON.stringify(registeredVoters));
    
    return voterData;
}
// In script.js, update the registration form handler
personalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if face was captured
    const faceDescriptor = document.getElementById('faceDescriptor').value;
    if (!faceDescriptor) {
        alert('Please complete face capture before submitting');
        return;
    }
    
    // Rest of your registration code...
});
// In the form submission handler, add face verification check
personalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if on laptop and face capture is required
    if (isLaptop()) {
        const faceDescriptor = document.getElementById('faceDescriptor').value;
        if (!faceDescriptor) {
            alert('Please complete face verification before submitting');
            return;
        }
    } else {
        alert('Please use a laptop or desktop computer to complete registration');
        return;
    }
    
    // Rest of your registration code...
});

// Add this helper function to script.js
function isLaptop() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLargeScreen = window.innerWidth >= 1024 && window.innerHeight >= 768;
    return (!isMobile && !hasTouch) || isLargeScreen;
}
app.post('/register', (req, res) => {
    const userAgent = req.headers['user-agent'];
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
        return res.status(403).json({ 
            error: 'Mobile registration not supported. Please use a laptop or desktop.' 
        });
    }
    
    // Rest of your registration logic...
});
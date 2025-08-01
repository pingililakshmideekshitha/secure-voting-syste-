pragma solidity ^0.8.0;

contract Voting {
    address public admin;
    uint public electionCount;
    
    struct Election {
        uint id;
        string name;
        uint startTime;
        uint endTime;
        bool isActive;
        bool resultsPublished;
    }
    
    struct Candidate {
        uint id;
        string name;
        uint partyId;
        uint voteCount;
    }
    
    mapping(uint => Election) public elections;
    mapping(uint => Candidate) public candidates;
    mapping(uint => mapping(uint => bool)) public electionCandidates;
    mapping(uint => mapping(address => bool)) public hasVoted;
    
    event VoterRegistered(address voter);
    event VoteCast(address voter, uint electionId, uint candidateId);
    event ElectionCreated(uint electionId);
    event ResultsPublished(uint electionId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function registerVoter() external {
        emit VoterRegistered(msg.sender);
    }
    
    function createElection(
        string memory _name,
        uint _startTime,
        uint _endTime
    ) external onlyAdmin {
        electionCount++;
        elections[electionCount] = Election(
            electionCount,
            _name,
            _startTime,
            _endTime,
            false,
            false
        );
        emit ElectionCreated(electionCount);
    }
    
    function addCandidate(
        uint _electionId,
        uint _candidateId,
        string memory _name,
        uint _partyId
    ) external onlyAdmin {
        require(elections[_electionId].id != 0, "Election does not exist");
        candidates[_candidateId] = Candidate(_candidateId, _name, _partyId, 0);
        electionCandidates[_electionId][_candidateId] = true;
    }
    
    function castVote(uint _electionId, uint _candidateId) external {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.startTime, "Election has not started");
        require(block.timestamp <= election.endTime, "Election has ended");
        require(!hasVoted[_electionId][msg.sender], "Already voted");
        require(electionCandidates[_electionId][_candidateId], "Invalid candidate");
        
        candidates[_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;
        
        emit VoteCast(msg.sender, _electionId, _candidateId);
    }
    
    function publishResults(uint _electionId) external onlyAdmin {
        require(elections[_electionId].id != 0, "Election does not exist");
        require(!elections[_electionId].resultsPublished, "Results already published");
        
        elections[_electionId].resultsPublished = true;
        elections[_electionId].isActive = false;
        
        emit ResultsPublished(_electionId);
    }
}
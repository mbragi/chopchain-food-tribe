// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVendorRegistry.sol";
import "./interfaces/IErrors.sol";

/**
 * @title VendorRegistry
 * @notice Comprehensive registry for ChopChain vendors with profile and menu management
 */
contract VendorRegistry is IVendorRegistry, Ownable {
    // Vendor storage
    mapping(address => VendorProfile) public vendorProfiles;
    mapping(address => bool) public override isVendor;
    
    // Menu storage
    mapping(address => mapping(uint256 => MenuItem)) public menuItems;
    mapping(address => uint256[]) public vendorMenuItems;
    mapping(address => uint256) public nextMenuItemId;
    
    // Vendor tracking
    address[] public vendorAddresses;
    uint256 public totalVendors;
    
    // Access control
    address public escrowContract;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Sets the escrow contract address (only owner)
     * @param _escrowContract The address of the escrow contract
     */
    function setEscrowContract(address _escrowContract) external onlyOwner {
        if (_escrowContract == address(0)) revert Errors.ZeroAddress();
        escrowContract = _escrowContract;
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function registerVendor(
        string calldata storeName,
        string calldata description,
        string calldata cuisineType,
        string calldata contactPhone,
        string calldata contactEmail,
        string calldata physicalAddress,
        uint256 deliveryRadius,
        uint256 minimumOrder,
        uint256 deliveryFee,
        uint256 preparationTime
    ) external override {
        if (isVendor[msg.sender]) revert Errors.AlreadyRegistered(msg.sender);
        if (bytes(storeName).length == 0) revert Errors.InvalidAmount(0);
        if (deliveryRadius == 0 || deliveryRadius > 100) revert Errors.InvalidAmount(deliveryRadius);
        if (minimumOrder == 0) revert Errors.InvalidAmount(minimumOrder);
        if (preparationTime == 0 || preparationTime > 300) revert Errors.InvalidAmount(preparationTime); // Max 5 hours

        // Create vendor profile
        vendorProfiles[msg.sender] = VendorProfile({
            vendorAddress: msg.sender,
            storeName: storeName,
            description: description,
            cuisineType: cuisineType,
            contactPhone: contactPhone,
            contactEmail: contactEmail,
            physicalAddress: physicalAddress,
            deliveryRadius: deliveryRadius,
            minimumOrder: minimumOrder,
            deliveryFee: deliveryFee,
            preparationTime: preparationTime,
            isActive: true,
            isOpen: true,
            rating: 500, // Default 5.00 rating
            totalOrders: 0,
            registeredAt: block.timestamp
        });

        isVendor[msg.sender] = true;
        vendorAddresses.push(msg.sender);
        totalVendors++;

        emit VendorRegistered(msg.sender, storeName, block.timestamp);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function updateVendorProfile(
        string calldata storeName,
        string calldata description,
        string calldata cuisineType,
        string calldata contactPhone,
        string calldata contactEmail,
        string calldata physicalAddress,
        uint256 deliveryRadius,
        uint256 minimumOrder,
        uint256 deliveryFee,
        uint256 preparationTime
    ) external override {
        if (!isVendor[msg.sender]) revert Errors.NotRegistered(msg.sender);
        if (bytes(storeName).length == 0) revert Errors.InvalidAmount(0);
        if (deliveryRadius == 0 || deliveryRadius > 100) revert Errors.InvalidAmount(deliveryRadius);
        if (minimumOrder == 0) revert Errors.InvalidAmount(minimumOrder);
        if (preparationTime == 0 || preparationTime > 300) revert Errors.InvalidAmount(preparationTime);

        VendorProfile storage profile = vendorProfiles[msg.sender];
        
        // Update profile data
        profile.storeName = storeName;
        profile.description = description;
        profile.cuisineType = cuisineType;
        profile.contactPhone = contactPhone;
        profile.contactEmail = contactEmail;
        profile.physicalAddress = physicalAddress;
        profile.deliveryRadius = deliveryRadius;
        profile.minimumOrder = minimumOrder;
        profile.deliveryFee = deliveryFee;
        profile.preparationTime = preparationTime;

        emit VendorProfileUpdated(msg.sender, storeName);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function setVendorStatus(bool isActive, bool isOpen) external override {
        if (!isVendor[msg.sender]) revert Errors.NotRegistered(msg.sender);
        
        VendorProfile storage profile = vendorProfiles[msg.sender];
        profile.isActive = isActive;
        profile.isOpen = isOpen;

        emit VendorStatusChanged(msg.sender, isActive, isOpen);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function addMenuItem(
        string calldata name,
        string calldata description,
        uint256 price,
        string calldata category,
        bool isPopular,
        uint256 spicyLevel
    ) external override {
        if (!isVendor[msg.sender]) revert Errors.NotRegistered(msg.sender);
        if (bytes(name).length == 0) revert Errors.InvalidAmount(0);
        if (price == 0) revert Errors.InvalidAmount(price);
        if (spicyLevel > 5) revert Errors.InvalidAmount(spicyLevel);

        uint256 itemId = nextMenuItemId[msg.sender];
        nextMenuItemId[msg.sender]++;

        menuItems[msg.sender][itemId] = MenuItem({
            itemId: itemId,
            name: name,
            description: description,
            price: price,
            category: category,
            isAvailable: true,
            isPopular: isPopular,
            spicyLevel: spicyLevel
        });

        vendorMenuItems[msg.sender].push(itemId);

        emit MenuItemAdded(msg.sender, itemId, name, price);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function updateMenuItem(
        uint256 itemId,
        string calldata name,
        string calldata description,
        uint256 price,
        string calldata category,
        bool isAvailable,
        bool isPopular,
        uint256 spicyLevel
    ) external override {
        if (!isVendor[msg.sender]) revert Errors.NotRegistered(msg.sender);
        if (menuItems[msg.sender][itemId].itemId != itemId) revert Errors.OrderNotFound("");
        if (bytes(name).length == 0) revert Errors.InvalidAmount(0);
        if (price == 0) revert Errors.InvalidAmount(price);
        if (spicyLevel > 5) revert Errors.InvalidAmount(spicyLevel);

        MenuItem storage item = menuItems[msg.sender][itemId];
        item.name = name;
        item.description = description;
        item.price = price;
        item.category = category;
        item.isAvailable = isAvailable;
        item.isPopular = isPopular;
        item.spicyLevel = spicyLevel;

        emit MenuItemUpdated(msg.sender, itemId, name, price);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function removeMenuItem(uint256 itemId) external override {
        if (!isVendor[msg.sender]) revert Errors.NotRegistered(msg.sender);
        if (menuItems[msg.sender][itemId].itemId != itemId) revert Errors.OrderNotFound("");

        // Remove from menu items mapping
        delete menuItems[msg.sender][itemId];

        // Remove from vendor's menu items array
        uint256[] storage items = vendorMenuItems[msg.sender];
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i] == itemId) {
                items[i] = items[items.length - 1];
                items.pop();
                break;
            }
        }

        emit MenuItemRemoved(msg.sender, itemId);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function updateVendorRating(address vendor, uint256 rating) external override {
        if (msg.sender != escrowContract) revert Errors.UnauthorizedCaller(msg.sender);
        if (!isVendor[vendor]) revert Errors.NotRegistered(vendor);
        if (rating < 100 || rating > 500) revert Errors.InvalidAmount(rating); // 1.00 to 5.00 stars

        VendorProfile storage profile = vendorProfiles[vendor];
        
        // Calculate new average rating
        uint256 totalRatingPoints = profile.rating * profile.totalOrders;
        totalRatingPoints += rating;
        profile.totalOrders++;
        profile.rating = totalRatingPoints / profile.totalOrders;

        emit VendorRated(vendor, profile.rating, profile.totalOrders);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function deregisterVendor(address vendor) external override onlyOwner {
        if (vendor == address(0)) revert Errors.ZeroAddress();
        if (!isVendor[vendor]) revert Errors.NotRegistered(vendor);

        isVendor[vendor] = false;
        delete vendorProfiles[vendor];
        
        // Clear all menu items
        uint256[] memory items = vendorMenuItems[vendor];
        for (uint256 i = 0; i < items.length; i++) {
            delete menuItems[vendor][items[i]];
        }
        delete vendorMenuItems[vendor];
        delete nextMenuItemId[vendor];
        
        // Remove from vendor addresses array
        for (uint256 i = 0; i < vendorAddresses.length; i++) {
            if (vendorAddresses[i] == vendor) {
                vendorAddresses[i] = vendorAddresses[vendorAddresses.length - 1];
                vendorAddresses.pop();
                break;
            }
        }
        
        totalVendors--;
        emit VendorDeregistered(vendor);
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function getVendorProfile(address vendor) external view override returns (VendorProfile memory profile) {
        if (!isVendor[vendor]) revert Errors.NotRegistered(vendor);
        return vendorProfiles[vendor];
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function getVendorMenu(address vendor) external view override returns (MenuItem[] memory items) {
        if (!isVendor[vendor]) revert Errors.NotRegistered(vendor);
        
        uint256[] memory itemIds = vendorMenuItems[vendor];
        items = new MenuItem[](itemIds.length);
        
        for (uint256 i = 0; i < itemIds.length; i++) {
            items[i] = menuItems[vendor][itemIds[i]];
        }
        
        return items;
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function getMenuItem(address vendor, uint256 itemId) external view override returns (MenuItem memory item) {
        if (!isVendor[vendor]) revert Errors.NotRegistered(vendor);
        if (menuItems[vendor][itemId].itemId != itemId) revert Errors.OrderNotFound("");
        
        return menuItems[vendor][itemId];
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function getActiveVendors() external view override returns (address[] memory vendors) {
        uint256 activeCount = 0;
        
        // First pass: count active vendors
        for (uint256 i = 0; i < vendorAddresses.length; i++) {
            if (vendorProfiles[vendorAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: populate array
        vendors = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < vendorAddresses.length; i++) {
            if (vendorProfiles[vendorAddresses[i]].isActive) {
                vendors[index] = vendorAddresses[i];
                index++;
            }
        }
        
        return vendors;
    }

    /**
     * @inheritdoc IVendorRegistry
     */
    function getTotalVendors() external view override returns (uint256 count) {
        return totalVendors;
    }

    /**
     * @notice Emergency batch deregistration of vendors (only owner)
     * @param vendors Array of vendor addresses to deregister
     */
    function batchDeregisterVendors(address[] calldata vendors) external onlyOwner {
        uint256 length = vendors.length;
        if (length == 0) revert Errors.InvalidAmount(0);

        for (uint256 i = 0; i < length;) {
            address vendor = vendors[i];
            if (vendor == address(0)) revert Errors.ZeroAddress();
            if (isVendor[vendor]) {
                isVendor[vendor] = false;
                delete vendorProfiles[vendor];
                
                // Clear menu items
                uint256[] memory items = vendorMenuItems[vendor];
                for (uint256 j = 0; j < items.length; j++) {
                    delete menuItems[vendor][items[j]];
                }
                delete vendorMenuItems[vendor];
                delete nextMenuItemId[vendor];
                
                totalVendors--;
                emit VendorDeregistered(vendor);
            }
            unchecked {
                i++;
            }
        }
        
        // Rebuild vendor addresses array to remove deregistered vendors
        address[] memory newVendorAddresses = new address[](totalVendors);
        uint256 index = 0;
        for (uint256 i = 0; i < vendorAddresses.length; i++) {
            if (isVendor[vendorAddresses[i]]) {
                newVendorAddresses[index] = vendorAddresses[i];
                index++;
            }
        }
        vendorAddresses = newVendorAddresses;
    }
}

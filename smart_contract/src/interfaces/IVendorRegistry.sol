// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVendorRegistry
 * @notice Interface for the ChopChain VendorRegistry contract that manages comprehensive vendor information
 */
interface IVendorRegistry {
    /**
     * @notice Vendor profile struct containing all vendor information
     * @param vendorAddress The blockchain address of the vendor
     * @param storeName The name of the restaurant/store  
     * @param description Brief description of the vendor's cuisine/specialty
     * @param cuisineType Type of cuisine (e.g., "Nigerian, African, Continental")
     * @param contactPhone Phone number for customer contact
     * @param contactEmail Email address for customer contact
     * @param physicalAddress Physical location of the restaurant
     * @param deliveryRadius Maximum delivery distance in kilometers
     * @param minimumOrder Minimum order amount in USD (scaled by 1e18)
     * @param deliveryFee Standard delivery fee in USD (scaled by 1e18)
     * @param preparationTime Average preparation time in minutes
     * @param isActive Whether the vendor is currently accepting orders
     * @param isOpen Whether the vendor is currently open for business
     * @param rating Average rating (scaled by 100, so 500 = 5.00 stars)
     * @param totalOrders Total number of completed orders
     * @param registeredAt Timestamp when vendor was registered
     */
    struct VendorProfile {
        address vendorAddress;
        string storeName;
        string description;
        string cuisineType;
        string contactPhone;
        string contactEmail;
        string physicalAddress;
        uint256 deliveryRadius; // in kilometers
        uint256 minimumOrder; // in USD (scaled by 1e18)
        uint256 deliveryFee; // in USD (scaled by 1e18) 
        uint256 preparationTime; // in minutes
        bool isActive;
        bool isOpen;
        uint256 rating; // scaled by 100
        uint256 totalOrders;
        uint256 registeredAt;
    }

    /**
     * @notice Menu item struct for vendor's food items
     * @param itemId Unique identifier for the menu item
     * @param name Name of the menu item
     * @param description Description of the menu item
     * @param price Price in USD (scaled by 1e18)
     * @param category Category of the item (e.g., "Rice", "Soup", "Protein")
     * @param isAvailable Whether the item is currently available
     * @param isPopular Whether the item is marked as popular
     * @param spicyLevel Spice level from 0-5 (0 = not spicy, 5 = very spicy)
     */
    struct MenuItem {
        uint256 itemId;
        string name;
        string description;
        uint256 price; // in USD (scaled by 1e18)
        string category;
        bool isAvailable;
        bool isPopular;
        uint256 spicyLevel;
    }

    /**
     * @notice Emitted when a new vendor is registered with full profile
     */
    event VendorRegistered(address indexed vendor, string storeName, uint256 timestamp);

    /**
     * @notice Emitted when a vendor profile is updated
     */
    event VendorProfileUpdated(address indexed vendor, string storeName);

    /**
     * @notice Emitted when a vendor is deregistered
     */
    event VendorDeregistered(address indexed vendor);

    /**
     * @notice Emitted when a vendor's operational status changes
     */
    event VendorStatusChanged(address indexed vendor, bool isActive, bool isOpen);

    /**
     * @notice Emitted when a menu item is added
     */
    event MenuItemAdded(address indexed vendor, uint256 indexed itemId, string name, uint256 price);

    /**
     * @notice Emitted when a menu item is updated
     */
    event MenuItemUpdated(address indexed vendor, uint256 indexed itemId, string name, uint256 price);

    /**
     * @notice Emitted when a menu item is removed
     */
    event MenuItemRemoved(address indexed vendor, uint256 indexed itemId);

    /**
     * @notice Emitted when vendor rating is updated
     */
    event VendorRated(address indexed vendor, uint256 newRating, uint256 totalOrders);

    /**
     * @notice Registers a vendor with comprehensive profile information
     * @param storeName Name of the restaurant/store
     * @param description Brief description of the cuisine/specialty
     * @param cuisineType Type of cuisine offered
     * @param contactPhone Phone number for customer contact
     * @param contactEmail Email address for customer contact  
     * @param physicalAddress Physical location of the restaurant
     * @param deliveryRadius Maximum delivery distance in kilometers
     * @param minimumOrder Minimum order amount in USD (scaled by 1e18)
     * @param deliveryFee Standard delivery fee in USD (scaled by 1e18)
     * @param preparationTime Average preparation time in minutes
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
    ) external;

    /**
     * @notice Updates vendor profile information
     * @param storeName Updated store name
     * @param description Updated description
     * @param cuisineType Updated cuisine type
     * @param contactPhone Updated phone number
     * @param contactEmail Updated email address
     * @param physicalAddress Updated physical address
     * @param deliveryRadius Updated delivery radius
     * @param minimumOrder Updated minimum order amount
     * @param deliveryFee Updated delivery fee
     * @param preparationTime Updated preparation time
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
    ) external;

    /**
     * @notice Sets vendor operational status
     * @param isActive Whether vendor is accepting orders
     * @param isOpen Whether vendor is currently open
     */
    function setVendorStatus(bool isActive, bool isOpen) external;

    /**
     * @notice Adds a new menu item
     * @param name Name of the menu item
     * @param description Description of the menu item
     * @param price Price in USD (scaled by 1e18)
     * @param category Category of the item
     * @param isPopular Whether the item should be marked as popular
     * @param spicyLevel Spice level from 0-5
     */
    function addMenuItem(
        string calldata name,
        string calldata description,
        uint256 price,
        string calldata category,
        bool isPopular,
        uint256 spicyLevel
    ) external;

    /**
     * @notice Updates an existing menu item
     * @param itemId ID of the item to update
     * @param name Updated name
     * @param description Updated description
     * @param price Updated price
     * @param category Updated category
     * @param isAvailable Whether the item is available
     * @param isPopular Whether the item is popular
     * @param spicyLevel Updated spice level
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
    ) external;

    /**
     * @notice Removes a menu item
     * @param itemId ID of the item to remove
     */
    function removeMenuItem(uint256 itemId) external;

    /**
     * @notice Updates vendor rating (only callable by Escrow contract)
     * @param vendor Address of the vendor to rate
     * @param rating New rating to add (1-5 stars, scaled by 100)
     */
    function updateVendorRating(address vendor, uint256 rating) external;

    /**
     * @notice Deregisters a vendor (only owner)
     * @param vendor Address of the vendor to deregister
     */
    function deregisterVendor(address vendor) external;

    /**
     * @notice Checks if an address is a registered vendor
     * @param vendor Address to check
     * @return status True if registered vendor
     */
    function isVendor(address vendor) external view returns (bool status);

    /**
     * @notice Gets complete vendor profile
     * @param vendor Address of the vendor
     * @return profile Complete vendor profile data
     */
    function getVendorProfile(address vendor) external view returns (VendorProfile memory profile);

    /**
     * @notice Gets all menu items for a vendor
     * @param vendor Address of the vendor
     * @return items Array of menu items
     */
    function getVendorMenu(address vendor) external view returns (MenuItem[] memory items);

    /**
     * @notice Gets a specific menu item
     * @param vendor Address of the vendor
     * @param itemId ID of the menu item
     * @return item Menu item data
     */
    function getMenuItem(address vendor, uint256 itemId) external view returns (MenuItem memory item);

    /**
     * @notice Gets all active vendors
     * @return vendors Array of active vendor addresses
     */
    function getActiveVendors() external view returns (address[] memory vendors);

    /**
     * @notice Gets total number of registered vendors
     * @return count Total vendor count
     */
    function getTotalVendors() external view returns (uint256 count);
}

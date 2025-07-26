// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VendorRegistry.sol";
import "../src/interfaces/IErrors.sol";

contract VendorRegistryTest is Test {
    VendorRegistry public vendorRegistry;
    
    address public owner = address(this);
    address public vendor1 = makeAddr("vendor1");
    address public vendor2 = makeAddr("vendor2");
    address public escrowContract = makeAddr("escrow");
    
    // Sample vendor data
    string[] cuisineTypes = ["Nigerian", "African"];
    string storeName = "Mama Temi's Kitchen";
    string description = "Authentic Nigerian cuisine";
    string contactPhone = "+234 801 234 5678";
    string contactEmail = "mamatemi@chopchain.com";
    string physicalAddress = "15 Victoria Island, Lagos, Nigeria";
    uint256 deliveryRadius = 8;
    uint256 minimumOrder = 10 * 1e18; // 10 USD
    uint256 deliveryFee = 2.5 * 1e18; // 2.5 USD
    uint256 preparationTime = 30; // 30 minutes

    event VendorRegistered(address indexed vendor, string storeName, uint256 timestamp);
    event VendorProfileUpdated(address indexed vendor, string storeName);
    event VendorStatusChanged(address indexed vendor, bool isActive);
    event BusinessHoursUpdated(address indexed vendor);
    event MenuItemAdded(address indexed vendor, uint256 indexed itemId, string name, uint256 price);
    event MenuItemUpdated(address indexed vendor, uint256 indexed itemId, string name, uint256 price);
    event MenuItemRemoved(address indexed vendor, uint256 indexed itemId);
    event VendorRated(address indexed vendor, uint256 newRating, uint256 totalOrders);
    event VendorDeregistered(address indexed vendor);

    function setUp() public {
        vendorRegistry = new VendorRegistry();
        vendorRegistry.setEscrowContract(escrowContract);
    }

    function testRegisterVendor() public {
        vm.startPrank(vendor1);
        
        vm.expectEmit(true, false, false, true);
        emit VendorRegistered(vendor1, storeName, block.timestamp);
        
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Verify registration
        assertTrue(vendorRegistry.isVendor(vendor1));
        assertEq(vendorRegistry.getTotalVendors(), 1);
        
        // Verify profile data
        IVendorRegistry.VendorProfile memory profile = vendorRegistry.getVendorProfile(vendor1);
        assertEq(profile.vendorAddress, vendor1);
        assertEq(profile.storeName, storeName);
        assertEq(profile.description, description);
        assertEq(profile.cuisineTypes.length, 2);
        assertEq(profile.cuisineTypes[0], "Nigerian");
        assertEq(profile.cuisineTypes[1], "African");
        assertEq(profile.contactPhone, contactPhone);
        assertEq(profile.contactEmail, contactEmail);
        assertEq(profile.physicalAddress, physicalAddress);
        assertEq(profile.deliveryRadius, deliveryRadius);
        assertEq(profile.minimumOrder, minimumOrder);
        assertEq(profile.deliveryFee, deliveryFee);
        assertEq(profile.preparationTime, preparationTime);
        assertTrue(profile.isActive);
        assertEq(profile.rating, 500); // Default 5.00 rating
        assertEq(profile.totalOrders, 0);
        assertEq(profile.registeredAt, block.timestamp);
        
        // Verify default business hours (9 AM to 9 PM)
        IVendorRegistry.DayHours[7] memory businessHours = vendorRegistry.getBusinessHours(vendor1);
        for (uint256 i = 0; i < 7; i++) {
            assertTrue(businessHours[i].isOperating);
            assertEq(businessHours[i].openTime, 540); // 9:00 AM
            assertEq(businessHours[i].closeTime, 1260); // 9:00 PM
        }
        
        vm.stopPrank();
    }

    function testRegisterVendorFailures() public {
        vm.startPrank(vendor1);
        
        // Should fail with empty store name
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        vendorRegistry.registerVendor(
            "",
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Should fail with empty cuisine types
        string[] memory emptyCuisines = new string[](0);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        vendorRegistry.registerVendor(
            storeName,
            description,
            emptyCuisines,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Should fail with invalid delivery radius
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            0, // Invalid delivery radius
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Should fail with invalid preparation time
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            0 // Invalid preparation time
        );
        
        vm.stopPrank();
    }

    function testRegisterVendorAlreadyRegistered() public {
        vm.startPrank(vendor1);
        
        // Register vendor first time
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Should fail when trying to register again
        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyRegistered.selector, vendor1));
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        vm.stopPrank();
    }

    function testUpdateVendorProfile() public {
        // Register vendor first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Update profile
        string[] memory newCuisineTypes = new string[](3);
        newCuisineTypes[0] = "Nigerian";
        newCuisineTypes[1] = "African";
        newCuisineTypes[2] = "Continental";
        
        string memory newStoreName = "Mama Temi's Expanded Kitchen";
        
        vm.expectEmit(true, false, false, true);
        emit VendorProfileUpdated(vendor1, newStoreName);
        
        vendorRegistry.updateVendorProfile(
            newStoreName,
            "Updated description",
            newCuisineTypes,
            "+234 801 234 9999",
            "newemail@chopchain.com",
            "New address",
            15, // New delivery radius
            5 * 1e18, // New minimum order
            3 * 1e18, // New delivery fee
            45 // New preparation time
        );
        
        // Verify updates
        IVendorRegistry.VendorProfile memory profile = vendorRegistry.getVendorProfile(vendor1);
        assertEq(profile.storeName, newStoreName);
        assertEq(profile.description, "Updated description");
        assertEq(profile.cuisineTypes.length, 3);
        assertEq(profile.cuisineTypes[2], "Continental");
        assertEq(profile.contactPhone, "+234 801 234 9999");
        assertEq(profile.contactEmail, "newemail@chopchain.com");
        assertEq(profile.physicalAddress, "New address");
        assertEq(profile.deliveryRadius, 15);
        assertEq(profile.minimumOrder, 5 * 1e18);
        assertEq(profile.deliveryFee, 3 * 1e18);
        assertEq(profile.preparationTime, 45);
        
        vm.stopPrank();
    }

    function testSetVendorStatus() public {
        // Register vendor first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Set to inactive
        vm.expectEmit(true, false, false, true);
        emit VendorStatusChanged(vendor1, false);
        
        vendorRegistry.setVendorStatus(false);
        
        IVendorRegistry.VendorProfile memory profile = vendorRegistry.getVendorProfile(vendor1);
        assertFalse(profile.isActive);
        
        vm.stopPrank();
    }

    function testUpdateBusinessHours() public {
        // Register vendor first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Create custom business hours
        IVendorRegistry.DayHours[7] memory newHours;
        for (uint256 i = 0; i < 7; i++) {
            if (i == 0 || i == 6) { // Sunday and Saturday - closed
                newHours[i] = IVendorRegistry.DayHours({
                    isOperating: false,
                    openTime: 0,
                    closeTime: 0
                });
            } else { // Monday to Friday - 8 AM to 10 PM
                newHours[i] = IVendorRegistry.DayHours({
                    isOperating: true,
                    openTime: 480, // 8:00 AM
                    closeTime: 1320 // 10:00 PM
                });
            }
        }
        
        vm.expectEmit(true, false, false, false);
        emit BusinessHoursUpdated(vendor1);
        
        vendorRegistry.updateBusinessHours(newHours);
        
        // Verify business hours
        IVendorRegistry.DayHours[7] memory businessHours = vendorRegistry.getBusinessHours(vendor1);
        assertFalse(businessHours[0].isOperating); // Sunday
        assertTrue(businessHours[1].isOperating); // Monday
        assertEq(businessHours[1].openTime, 480);
        assertEq(businessHours[1].closeTime, 1320);
        assertFalse(businessHours[6].isOperating); // Saturday
        
        vm.stopPrank();
    }

    function testAddMenuItem() public {
        // Register vendor first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Add menu item
        string memory itemName = "Jollof Rice with Chicken";
        string memory itemDescription = "Perfectly seasoned rice with chicken and plantains";
        uint256 itemPrice = 15.99 * 1e18;
        string memory itemCategory = "Rice";
        bool isPopular = true;
        uint256 spicyLevel = 2;
        
        vm.expectEmit(true, true, false, true);
        emit MenuItemAdded(vendor1, 0, itemName, itemPrice);
        
        vendorRegistry.addMenuItem(
            itemName,
            itemDescription,
            itemPrice,
            itemCategory,
            isPopular,
            spicyLevel
        );
        
        // Verify menu item
        IVendorRegistry.MenuItem memory item = vendorRegistry.getMenuItem(vendor1, 0);
        assertEq(item.itemId, 0);
        assertEq(item.name, itemName);
        assertEq(item.description, itemDescription);
        assertEq(item.price, itemPrice);
        assertEq(item.category, itemCategory);
        assertTrue(item.isAvailable);
        assertTrue(item.isPopular);
        assertEq(item.spicyLevel, spicyLevel);
        
        // Verify vendor menu
        IVendorRegistry.MenuItem[] memory menu = vendorRegistry.getVendorMenu(vendor1);
        assertEq(menu.length, 1);
        assertEq(menu[0].name, itemName);
        
        vm.stopPrank();
    }

    function testUpdateMenuItem() public {
        // Register vendor and add menu item first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        vendorRegistry.addMenuItem(
            "Jollof Rice",
            "Original description",
            15 * 1e18,
            "Rice",
            false,
            1
        );
        
        // Update menu item
        string memory newName = "Special Jollof Rice";
        string memory newDescription = "Updated description with special ingredients";
        uint256 newPrice = 18 * 1e18;
        
        vm.expectEmit(true, true, false, true);
        emit MenuItemUpdated(vendor1, 0, newName, newPrice);
        
        vendorRegistry.updateMenuItem(
            0, // itemId
            newName,
            newDescription,
            newPrice,
            "Rice",
            false, // not available
            true, // popular
            3 // spicy level
        );
        
        // Verify updates
        IVendorRegistry.MenuItem memory item = vendorRegistry.getMenuItem(vendor1, 0);
        assertEq(item.name, newName);
        assertEq(item.description, newDescription);
        assertEq(item.price, newPrice);
        assertFalse(item.isAvailable);
        assertTrue(item.isPopular);
        assertEq(item.spicyLevel, 3);
        
        vm.stopPrank();
    }

    function testRemoveMenuItem() public {
        // Register vendor and add menu items first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        vendorRegistry.addMenuItem("Item 1", "Description 1", 10 * 1e18, "Category", false, 1);
        vendorRegistry.addMenuItem("Item 2", "Description 2", 20 * 1e18, "Category", false, 2);
        
        // Remove first item
        vm.expectEmit(true, true, false, false);
        emit MenuItemRemoved(vendor1, 0);
        
        vendorRegistry.removeMenuItem(0);
        
        // Verify menu now has only one item
        IVendorRegistry.MenuItem[] memory menu = vendorRegistry.getVendorMenu(vendor1);
        assertEq(menu.length, 1);
        assertEq(menu[0].name, "Item 2");
        
        vm.stopPrank();
    }

    function testUpdateVendorRating() public {
        // Register vendor first
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        vm.stopPrank();
        
        // Update rating from escrow contract
        vm.startPrank(escrowContract);
        
        uint256 newRating = 400; // 4.00 stars
        
        vm.expectEmit(true, false, false, true);
        emit VendorRated(vendor1, 450, 1); // Average of 500 and 400 = 450
        
        vendorRegistry.updateVendorRating(vendor1, newRating);
        
        // Verify rating update
        IVendorRegistry.VendorProfile memory profile = vendorRegistry.getVendorProfile(vendor1);
        assertEq(profile.rating, 450); // (500 + 400) / 2
        assertEq(profile.totalOrders, 1);
        
        vm.stopPrank();
    }

    function testGetActiveVendors() public {
        // Register two vendors
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        vm.stopPrank();
        
        vm.startPrank(vendor2);
        vendorRegistry.registerVendor(
            "Store 2",
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        // Set vendor2 to inactive
        vendorRegistry.setVendorStatus(false);
        vm.stopPrank();
        
        // Get active vendors
        address[] memory activeVendors = vendorRegistry.getActiveVendors();
        assertEq(activeVendors.length, 1);
        assertEq(activeVendors[0], vendor1);
    }

    function testDeregisterVendor() public {
        // Register vendor and add menu item
        vm.startPrank(vendor1);
        vendorRegistry.registerVendor(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        vendorRegistry.addMenuItem("Test Item", "Description", 10 * 1e18, "Category", false, 1);
        vm.stopPrank();
        
        // Deregister vendor (only owner can do this)
        vm.expectEmit(true, false, false, false);
        emit VendorDeregistered(vendor1);
        
        vendorRegistry.deregisterVendor(vendor1);
        
        // Verify deregistration
        assertFalse(vendorRegistry.isVendor(vendor1));
        assertEq(vendorRegistry.getTotalVendors(), 0);
        
        // Should revert when trying to get profile
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, vendor1));
        vendorRegistry.getVendorProfile(vendor1);
    }

    function testUnauthorizedOperations() public {
        vm.startPrank(vendor1);
        
        // Should fail to update profile when not registered
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, vendor1));
        vendorRegistry.updateVendorProfile(
            storeName,
            description,
            cuisineTypes,
            contactPhone,
            contactEmail,
            physicalAddress,
            deliveryRadius,
            minimumOrder,
            deliveryFee,
            preparationTime
        );
        
        // Should fail to add menu item when not registered
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, vendor1));
        vendorRegistry.addMenuItem("Test", "Description", 10 * 1e18, "Category", false, 1);
        
        vm.stopPrank();
    }
}
package com.nd.enums;

public enum Category {

    FURNITURE,
    ELECTRONICS,
    LAB_EQUIPMENT,
    BOOKS,
    SPORTS,
    STATIONERY,
    CLOTHING,
    HOSTEL_SUPPLIES,
    MUSICAL_INSTRUMENTS,
    VEHICLES,
    STUDY_MATERIALS,
    OTHER;

    @Override
    public String toString() {
        // Convert enum to a readable string (e.g., "Lab Equipment" instead of "LAB_EQUIPMENT")
        return name().replace('_', ' ').toLowerCase();
    }

}

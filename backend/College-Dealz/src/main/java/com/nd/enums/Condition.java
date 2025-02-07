package com.nd.enums;

public enum  Condition {

    NEW,
    LIKE_NEW,
    GOOD,
    FAIR,
    POOR;

    @Override
    public String toString() {
        return name().toLowerCase().replace('_', ' ');
    }

}
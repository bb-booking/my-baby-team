import React from 'react';

// Component for displaying the pregnancy week bar
const PregnancyWeekBar = ({ week }) => {
    return (
        <div className="pregnancy-week-bar">
            <h2>Week {week}</h2>
        </div>
    );
};

// Component for displaying the size of the baby
const BabySizeCard = ({ size }) => {
    return (
        <div className="baby-size-card">
            <h3>Your baby is the size of a(n) {size}!</h3>
        </div>
    );
};

// Component for displaying insights during pregnancy
const PregnancyInsight = ({ insight }) => {
    return (
        <div className="pregnancy-insight">
            <p>{insight}</p>
        </div>
    );
};

export { PregnancyWeekBar, BabySizeCard, PregnancyInsight };
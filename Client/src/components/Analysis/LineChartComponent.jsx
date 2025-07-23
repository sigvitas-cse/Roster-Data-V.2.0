// LineChartComponent.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalProfiles" stroke="#8884d8" strokeWidth={3} name="Total Profiles" />
        <Line type="monotone" dataKey="revisedProfiles" stroke="#82ca9d" strokeWidth={3} name="Revised Profiles" />
        <Line type="monotone" dataKey="newProfiles" stroke="#FFBB28" strokeWidth={3} name="New Profiles" />
        <Line type="monotone" dataKey="removedProfiles" stroke="#FF8042" strokeWidth={3} name="Removed Profiles" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;

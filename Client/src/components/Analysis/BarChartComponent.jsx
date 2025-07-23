// BarChartComponent.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart data={data}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revisedProfiles" fill="#82ca9d" name="Revised Profiles" />
        <Bar dataKey="newProfiles" fill="#FFBB28" name="New Profiles" />
        <Bar dataKey="removedProfiles" fill="#FF8042" name="Removed Profiles" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;


import React from 'react';

interface PayloadItem {
  name: string;
  value: number;
  color: string;
}

export const CustomTooltip = ({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="font-bold">
            {`${entry.name}: $${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

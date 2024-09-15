import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import axios from "axios";  // Import axios for API requests

const getPanelColors = (maxCount) => {
  const colors = {};
  for (let i = 0; i <= maxCount; i++) {
    const greenValue = Math.floor((i / maxCount) * 255);
    colors[i] = `rgb(0, ${greenValue}, 0)`;
  }
  return colors;
};

const HeatMapProfile = ({ repoId }) => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors] = useState({});

  useEffect(() => {
    const fetchCommitData = async () => {
      try {
        const response = await axios.get(`/commitCounts/${repoId}`);
        const data = response.data.map(commit => ({
          date: commit._id,
          count: commit.count
        }));
        setActivityData(data);

        const maxCount = Math.max(...data.map(d => d.count));
        setPanelColors(getPanelColors(maxCount));
      } catch (error) {
        console.error("Error fetching commit data: ", error);
      }
    };

    fetchCommitData();
  }, [repoId]);

  return (
    <div>
      <h4>Recent Contributions</h4>
      <HeatMap
        className="HeatMapProfile"
        style={{ maxWidth: "700px", height: "200px", color: "white" }}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        rectSize={15}
        space={3}
        rectProps={{
          rx: 2.5,
        }}
        panelColors={panelColors}
      />
    </div>
  );
};

export default HeatMapProfile;

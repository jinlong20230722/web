import PERSONNEL from '../pages/personnel.jsx';
import ATTENDANCE from '../pages/attendance.jsx';
import LEAVE_REQUEST from '../pages/leave_request.jsx';
import EVENT_REPORT from '../pages/event_report.jsx';
import FEEDBACK from '../pages/feedback.jsx';
import ANNOUNCEMENT from '../pages/announcement.jsx';
import HOME from '../pages/home.jsx';
import DATA_COCKPIT from '../pages/data_cockpit.jsx';
export const routers = [{
  id: "personnel",
  component: PERSONNEL
}, {
  id: "attendance",
  component: ATTENDANCE
}, {
  id: "leave_request",
  component: LEAVE_REQUEST
}, {
  id: "event_report",
  component: EVENT_REPORT
}, {
  id: "feedback",
  component: FEEDBACK
}, {
  id: "announcement",
  component: ANNOUNCEMENT
}, {
  id: "home",
  component: HOME
}, {
  id: "data_cockpit",
  component: DATA_COCKPIT
}]
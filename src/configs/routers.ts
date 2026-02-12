import HOME from '../pages/home.jsx';
import PERSONNEL from '../pages/personnel.jsx';
import ATTENDANCE from '../pages/attendance.jsx';
import LEAVE from '../pages/leave.jsx';
import EVENT from '../pages/event.jsx';
import FEEDBACK from '../pages/feedback.jsx';
import ANNOUNCEMENT from '../pages/announcement.jsx';
import PERSONNELLEDGER from '../pages/personnelLedger.jsx';
import ATTENDANCEMANAGEMENT from '../pages/attendanceManagement.jsx';
import LEAVEAPPROVAL from '../pages/leaveApproval.jsx';
import EVENTREPORTMANAGEMENT from '../pages/eventReportManagement.jsx';
import FEEDBACKMANAGEMENT from '../pages/feedbackManagement.jsx';
import ANNOUNCEMENTMANAGEMENT from '../pages/announcementManagement.jsx';
import ROLEMANAGEMENT from '../pages/roleManagement.jsx';
export const routers = [{
  id: "home",
  component: HOME
}, {
  id: "personnel",
  component: PERSONNEL
}, {
  id: "attendance",
  component: ATTENDANCE
}, {
  id: "leave",
  component: LEAVE
}, {
  id: "event",
  component: EVENT
}, {
  id: "feedback",
  component: FEEDBACK
}, {
  id: "announcement",
  component: ANNOUNCEMENT
}, {
  id: "personnelLedger",
  component: PERSONNELLEDGER
}, {
  id: "attendanceManagement",
  component: ATTENDANCEMANAGEMENT
}, {
  id: "leaveApproval",
  component: LEAVEAPPROVAL
}, {
  id: "eventReportManagement",
  component: EVENTREPORTMANAGEMENT
}, {
  id: "feedbackManagement",
  component: FEEDBACKMANAGEMENT
}, {
  id: "announcementManagement",
  component: ANNOUNCEMENTMANAGEMENT
}, {
  id: "roleManagement",
  component: ROLEMANAGEMENT
}]
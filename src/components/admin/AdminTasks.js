import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";

import {
  assignAdminTask,
  fetchAllAdminTasks,
  fetchMyAdminTasks,
  updateAdminTaskStatus,
  deleteAdminTask,
  fetchAllAdmins,
  updateAdminTask,
} from "../../services/adminService";

const statusOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const moduleOptions = [
  "GENERAL",
  "MODERATION",
  "USERS",
  "EVENTS",
  "VENUES",
  "PAYMENTS",
  "EMAILS",
  "NOTIFICATIONS",
  "SERVICES",
  "PERFORMANCE",
];

const allowedModulesByRole = {
  ADMIN: [
    "GENERAL",
    "USERS",
    "EVENTS",
    "VENUES",
    "PAYMENTS",
    "EMAILS",
    "NOTIFICATIONS",
    "SERVICES",
    "PERFORMANCE",
  ],
  MODERATOR: ["GENERAL", "MODERATION", "NOTIFICATIONS"],
};

const statusChipColor = (status) => {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "warning";
  return "default";
};

const priorityChipColor = (priority) => {
  if (priority === "URGENT") return "error";
  if (priority === "HIGH") return "warning";
  if (priority === "LOW") return "default";
  return "primary";
};

const moduleChipColor = (module) => {
  if (module === "MODERATION") return "warning";
  if (module === "PAYMENTS") return "success";
  if (module === "EMAILS") return "primary";
  if (module === "NOTIFICATIONS") return "info";
  return "default";
};

const formatDate = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "N/A";
  }
};

const toInputDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const AdminTasks = ({ adminProfile }) => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const isSuperAdmin = adminProfile?.role === "SUPER_ADMIN";

  const [tasks, setTasks] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterModule, setFilterModule] = useState("");

  // Assign form
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM",
    dueDate: "",
    module: "GENERAL",
  });

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Edit modal
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM",
    dueDate: "",
    status: "PENDING",
    module: "GENERAL",
  });

  const fetchTasks = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = isSuperAdmin
        ? await fetchAllAdminTasks()
        : await fetchMyAdminTasks();

      setTasks(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminsList = async () => {
    if (!isSuperAdmin) return;

    try {
      const data = await fetchAllAdmins();
      const filtered = (data || []).filter((a) => a.role !== "SUPER_ADMIN");
      setAdmins(filtered);
    } catch (err) {
      console.error("Failed to fetch admins list");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAdminsList();
    // eslint-disable-next-line
  }, [isSuperAdmin]);

  const selectedAdminRole = useMemo(() => {
    const found = admins.find((a) => a._id === taskForm.assignedTo);
    return found?.role || "";
  }, [admins, taskForm.assignedTo]);

  const availableModulesForSelectedRole = useMemo(() => {
    if (!selectedAdminRole) return moduleOptions;
    return allowedModulesByRole[selectedAdminRole] || ["GENERAL"];
  }, [selectedAdminRole]);

  // Ensure module stays valid when admin changes
  useEffect(() => {
    if (!selectedAdminRole) return;

    const allowed = allowedModulesByRole[selectedAdminRole] || ["GENERAL"];

    if (!allowed.includes(taskForm.module)) {
      setTaskForm((prev) => ({ ...prev, module: allowed[0] || "GENERAL" }));
    }
    // eslint-disable-next-line
  }, [selectedAdminRole]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = task?.title?.toLowerCase() || "";
      const desc = task?.description?.toLowerCase() || "";
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query || title.includes(query) || desc.includes(query);

      const matchesStatus = !filterStatus || task.status === filterStatus;
      const matchesPriority =
        !filterPriority || task.priority === filterPriority;

      const matchesModule = !filterModule || task.module === filterModule;

      return matchesSearch && matchesStatus && matchesPriority && matchesModule;
    });
  }, [tasks, search, filterStatus, filterPriority, filterModule]);

  const handleAssignChange = (e) => {
    setTaskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAssignForm = () => {
    if (!taskForm.title.trim()) return "Task title is required.";
    if (!taskForm.assignedTo) return "Please select an admin to assign.";
    if (!taskForm.module) return "Task module is required.";
    return null;
  };

  const handleAssignTask = async () => {
    setError("");
    setSuccess("");

    const validationError = validateAssignForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoading(true);

    try {
      await assignAdminTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assignedTo: taskForm.assignedTo,
        priority: taskForm.priority,
        module: taskForm.module,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : null,
      });

      setSuccess("Task assigned successfully.");
      setTaskForm({
        title: "",
        description: "",
        assignedTo: "",
        priority: "MEDIUM",
        dueDate: "",
        module: "GENERAL",
      });

      await fetchTasks();
    } catch (err) {
      setError(err?.message || "Failed to assign task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      await updateAdminTaskStatus(taskId, status);
      setSuccess("Task status updated.");
      await fetchTasks();
    } catch (err) {
      setError(err?.message || "Failed to update task.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setTaskToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      await deleteAdminTask(taskToDelete._id);
      setSuccess("Task deleted successfully.");
      closeDeleteDialog();
      await fetchTasks();
    } catch (err) {
      setError(err?.message || "Failed to delete task.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (task) => {
    setTaskToEdit(task);

    setEditForm({
      title: task.title || "",
      description: task.description || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      priority: task.priority || "MEDIUM",
      dueDate: toInputDate(task.dueDate),
      status: task.status || "PENDING",
      module: task.module || "GENERAL",
    });

    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setTaskToEdit(null);
    setEditDialogOpen(false);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEditForm = () => {
    if (!editForm.title.trim()) return "Task title is required.";
    if (!editForm.assignedTo) return "Assigned admin is required.";
    if (!editForm.module) return "Task module is required.";
    return null;
  };

  const handleSaveEdit = async () => {
    if (!taskToEdit) return;

    setError("");
    setSuccess("");

    const validationError = validateEditForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoading(true);

    try {
      await updateAdminTask(taskToEdit._id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        assignedTo: editForm.assignedTo,
        priority: editForm.priority,
        status: editForm.status,
        module: editForm.module,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate) : null,
      });

      setSuccess("Task updated successfully.");
      closeEditDialog();
      await fetchTasks();
    } catch (err) {
      setError(err?.message || "Failed to update task.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Tasks
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {isSuperAdmin
              ? "Assign role-based tasks to admins and moderators."
              : "View and manage your assigned tasks."}
          </Typography>
        </Box>

        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={fetchTasks}
          disabled={loading}
          sx={{ fontWeight: 800, borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {/* ASSIGN FORM */}
      {isSuperAdmin && (
        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6" fontWeight={900}>
              Assign New Task
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Tasks are restricted based on admin roles (ADMIN vs MODERATOR).
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Task Title"
              name="title"
              value={taskForm.title}
              onChange={handleAssignChange}
              fullWidth
            />

            <TextField
              select
              label="Assign To"
              name="assignedTo"
              value={taskForm.assignedTo}
              onChange={handleAssignChange}
              fullWidth
            >
              {admins.map((admin) => (
                <MenuItem key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email}) - {admin.role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Task Module"
              name="module"
              value={taskForm.module}
              onChange={handleAssignChange}
              fullWidth
              disabled={!taskForm.assignedTo}
              helperText={
                selectedAdminRole
                  ? `Allowed modules for ${selectedAdminRole}`
                  : "Select an admin first"
              }
            >
              {availableModulesForSelectedRole.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              name="priority"
              value={taskForm.priority}
              onChange={handleAssignChange}
              fullWidth
            >
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={taskForm.dueDate}
              onChange={handleAssignChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Task Description"
              name="description"
              value={taskForm.description}
              onChange={handleAssignChange}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}
            />

            <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
              <Button
                variant="contained"
                onClick={handleAssignTask}
                disabled={actionLoading}
                sx={{ fontWeight: 900, borderRadius: 2, py: 1.2 }}
                fullWidth={isMobile}
              >
                {actionLoading ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Assign Task"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* FILTER BAR */}
      <Paper elevation={2} sx={{ borderRadius: 3, p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Search Tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {priorityOptions.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Module"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {moduleOptions.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* TASK LIST */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={900}>
            {isSuperAdmin ? "All Tasks" : "My Tasks"}
          </Typography>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total: {filteredTasks.length}
          </Typography>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Loading tasks...
            </Typography>
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No tasks found.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#fafafa" }}>
                  <TableCell sx={{ fontWeight: 900 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Module</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Due Date</TableCell>

                  {isSuperAdmin && (
                    <TableCell sx={{ fontWeight: 900 }}>Assigned To</TableCell>
                  )}

                  <TableCell sx={{ fontWeight: 900 }}>Assigned By</TableCell>

                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task._id} hover>
                    <TableCell>
                      <Typography fontWeight={800}>{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {task.description}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={task.status}
                        size="small"
                        color={statusChipColor(task.status)}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={priorityChipColor(task.priority)}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={task.module || "GENERAL"}
                        size="small"
                        color={moduleChipColor(task.module)}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell>{formatDate(task.dueDate)}</TableCell>

                    {isSuperAdmin && (
                      <TableCell>
                        {task.assignedTo?.name || "N/A"}
                        <br />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {task.assignedTo?.email || ""}
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Role: {task.assignedToRole || task.assignedTo?.role || "N/A"}
                        </Typography>
                      </TableCell>
                    )}

                    <TableCell>
                      {task.assignedBy?.name || "N/A"}
                      <br />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {task.assignedBy?.email || ""}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        {!isSuperAdmin && (
                          <TextField
                            select
                            size="small"
                            value={task.status}
                            disabled={actionLoading}
                            onChange={(e) =>
                              handleUpdateStatus(task._id, e.target.value)
                            }
                            sx={{ minWidth: 160 }}
                          >
                            {statusOptions.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}

                        {isSuperAdmin && (
                          <>
                            <Tooltip title="Edit Task">
                              <IconButton
                                onClick={() => openEditDialog(task)}
                                disabled={actionLoading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Task">
                              <IconButton
                                color="error"
                                onClick={() => openDeleteDialog(task)}
                                disabled={actionLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this task?
          </Typography>
          <Typography variant="caption" sx={{ color: "error.main" }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteTask}
            disabled={actionLoading}
            sx={{ fontWeight: 900 }}
          >
            {actionLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Task</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              select
              label="Assigned To"
              name="assignedTo"
              value={editForm.assignedTo}
              onChange={handleEditChange}
              fullWidth
            >
              {admins.map((admin) => (
                <MenuItem key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email}) - {admin.role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Task Module"
              name="module"
              value={editForm.module}
              onChange={handleEditChange}
              fullWidth
            >
              {moduleOptions.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              name="priority"
              value={editForm.priority}
              onChange={handleEditChange}
              fullWidth
            >
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              fullWidth
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={editForm.dueDate}
              onChange={handleEditChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeEditDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={actionLoading}
            sx={{ fontWeight: 900 }}
          >
            {actionLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTasks;
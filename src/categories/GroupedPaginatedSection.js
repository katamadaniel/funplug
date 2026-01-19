import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Pagination,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const PAGE_SIZE = 20;

const GroupedPaginatedSection = ({
  title,
  items,
  renderCard,
}) => {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const paginated = items.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <Box mb={4}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton size="small" onClick={() => setOpen(!open)}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>

        <Typography variant="h6">
          {title} ({items.length})
        </Typography>
      </Box>

      {/* Collapsible content */}
      <Collapse in={open}>
        <Grid container spacing={2} mt={1}>
          {paginated.map(renderCard)}
        </Grid>

        {pageCount > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, p) => setPage(p)}
            />
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default GroupedPaginatedSection;

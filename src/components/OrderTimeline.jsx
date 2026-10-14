import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Button,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const STEPS = [
  {
    status: 'Order Received',
    label: 'Order Received',
    desc: 'Sent to restaurant kitchen',
  },
  {
    status: 'Preparing',
    label: 'Kitchen Preparing',
    desc: 'Chef is crafting your food',
  },
  {
    status: 'Out for Delivery',
    label: 'Out for Delivery',
    desc: 'Courier en route to your address',
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Enjoy your warm delicious meal!',
  },
];

const OrderTimeline = ({ order, onSimulateNext, isSimulating }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentStatus = order?.status || 'Order Received';
  const isCancelled = currentStatus === 'Cancelled';

  const activeStep = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
      }}
    >
      {/* Top Header with current status & action */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          pb: 3,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Box>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Live Order State
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Typography variant="h5" fontWeight={900} color="#0f172a">
              {currentStatus}
            </Typography>
            {currentStatus !== 'Delivered' && !isCancelled && (
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#ea580c !important' }} />}
                label="In Progress"
                size="small"
                sx={{
                  bgcolor: '#fff7ed',
                  color: '#c2410c',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: '1px solid #ffedd5',
                }}
              />
            )}
            {currentStatus === 'Delivered' && (
              <Chip
                label="Delivered"
                size="small"
                sx={{
                  bgcolor: '#ecfdf5',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: '1px solid #a7f3d0',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Demo Advance Status Trigger */}
        {currentStatus !== 'Delivered' && !isCancelled && onSimulateNext && (
          <Button
            variant="contained"
            onClick={onSimulateNext}
            disabled={isSimulating}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              fontWeight: 800,
              fontSize: '0.8rem',
              borderRadius: 3,
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #c2410c 100%)',
              },
            }}
          >
            {isSimulating ? 'Updating...' : 'Simulate Next Stage'}
          </Button>
        )}
      </Box>

      {/* Stepper: Responsive (Horizontal on desktop, Vertical on mobile) */}
      <Box sx={{ py: 4 }}>
        <Stepper
          activeStep={activeStep === -1 ? 0 : activeStep}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{
            '& .MuiStepLabel-label': {
              fontWeight: 700,
              fontSize: '0.85rem',
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: 'primary.main',
              fontWeight: 900,
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepIcon-root.Mui-active': {
              color: 'primary.main',
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: 'success.main',
            },
          }}
        >
          {STEPS.map((step) => (
            <Step key={step.status}>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary" display="block">
                    {step.desc}
                  </Typography>
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Real-Time Activity Log */}
      <Box sx={{ pt: 3, borderTop: '1px solid #f1f5f9' }}>
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            mb: 2,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 15 }} />
          Live Progress Log
        </Typography>

        <Stack spacing={1.5}>
          {(order?.statusHistory || []).map((entry, index) => (
            <Box
              key={index}
              sx={{
                p: 1.8,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ea580c' }} />
                <Typography variant="body2" fontWeight={800} color="#0f172a">
                  {entry.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                  — {entry.note}
                </Typography>
              </Box>
              <Typography variant="caption" color="#94a3b8" fontWeight={700}>
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default OrderTimeline;

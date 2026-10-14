import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MenuItemCard = ({ item }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const { isAdmin } = useAuth();

  const cartItem = items.find((i) => i._id === item._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 30px -10px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Uniform Fixed-Height Food Media (200px) */}
      <Box sx={{ position: 'relative', width: '100%', height: 200, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={item.image}
          alt={item.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Category Chip */}
        <Chip
          label={item.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            fontWeight: 800,
            fontSize: '0.7rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        />
        {/* Rating Chip */}
        <Chip
          icon={<StarIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
          label={item.rating || 4.8}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            fontWeight: 800,
            fontSize: '0.7rem',
            color: '#b45309',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        />
      </Box>

      {/* Card Details: Uniform flex column */}
      <CardContent
        sx={{
          p: 2.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          {/* Uniform Title: 1 line with fixed line height */}
          <Typography
            variant="subtitle1"
            fontWeight={800}
            color="#0f172a"
            title={item.name}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              height: '1.5em',
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {item.name}
          </Typography>

          {/* Uniform Description: exactly 2 lines with fixed line height */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              height: '3em',
              mb: 1.5,
            }}
          >
            {item.description}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: '#94a3b8', mb: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={600}>
              {item.preparationTimeMinutes || 20} mins prep
            </Typography>
          </Stack>
        </Box>

        {/* Footer: Price & Add Button pinned to bottom */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 2,
            mt: 'auto',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
              Price
            </Typography>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              ${item.price.toFixed(2)}
            </Typography>
          </Box>

          {isAdmin ? (
            <Chip
              label="Staff View"
              size="small"
              sx={{
                bgcolor: '#fef3c7',
                color: '#b45309',
                fontWeight: 800,
                fontSize: '0.72rem',
                border: '1px solid #fde68a',
                py: 1.4,
                px: 0.8,
              }}
            />
          ) : quantityInCart > 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#fff7ed',
                border: '1px solid #fdba74',
                borderRadius: 2.5,
                px: 0.5,
                py: 0.3,
              }}
            >
              <IconButton
                size="small"
                onClick={() => updateQuantity(item._id, quantityInCart - 1)}
                sx={{ bgcolor: '#ffffff', color: '#ea580c', p: 0.5, '&:hover': { bgcolor: '#ea580c', color: '#ffffff' } }}
              >
                <RemoveIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography variant="body2" fontWeight={800} sx={{ width: 28, textAlign: 'center', color: '#9a3412' }}>
                {quantityInCart}
              </Typography>
              <IconButton
                size="small"
                onClick={() => updateQuantity(item._id, quantityInCart + 1)}
                sx={{ bgcolor: '#ffffff', color: '#ea580c', p: 0.5, '&:hover': { bgcolor: '#ea580c', color: '#ffffff' } }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => addToCart(item, 1)}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.78rem',
                py: 0.8,
                px: 1.8,
                '&:hover': { bgcolor: '#ea580c' },
              }}
            >
              Add to Cart
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;

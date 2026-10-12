import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import { ArrowBack, NotificationsNone, MarkEmailRead } from '@mui/icons-material';
import api from '../../utils/api';

const formatDate = (value) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch {
        return value;
    }
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/api/notifications');
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (notificationId) => {
        try {
            await api.patch(`/api/notifications/${notificationId}/read`);
            setNotifications((prev) => prev.map((item) => item.id === notificationId ? { ...item, read_at: item.read_at || new Date().toISOString() } : item));
            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch {
            // ignore
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
            setUnreadCount(0);
        } catch {
            // ignore
        }
    };

    const handleOpen = async (item) => {
        if (!item.read_at) {
            await handleMarkRead(item.id);
        }

        if (item.type === 'MEAT_ORDER_REQUEST') {
            navigate('/orders');
            return;
        }

        if (item.type === 'MEAT_ORDER_PICKED_UP') {
            navigate('/orders');
        }
    };

    return (
        <Container maxWidth="md" sx={ { py: 4 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' } }>
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                    <IconButton onClick={ () => navigate(-1) }>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" fontWeight={ 800 }>
                        Notifications
                    </Typography>
                </Box>

                { notifications.length > 0 && (
                    <Button variant="outlined" startIcon={ <MarkEmailRead /> } onClick={ handleMarkAllRead }>
                        Mark all read
                    </Button>
                ) }
            </Box>

            <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 } }>
                <Typography variant="body2" color="text.secondary">
                    { unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }
                </Typography>
                { unreadCount > 0 && <Chip label={ unreadCount } color="primary" size="small" /> }
            </Box>

            <Divider sx={ { mb: 2 } } />

            { loading ? (
                <Box sx={ { display: 'flex', justifyContent: 'center', py: 8 } }>
                    <CircularProgress />
                </Box>
            ) : notifications.length === 0 ? (
                <Alert icon={ <NotificationsNone /> } severity="info" sx={ { borderRadius: 3 } }>
                    No notifications yet.
                </Alert>
            ) : (
                <List sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
                    { notifications.map((item) => (
                        <ListItem key={ item.id } disablePadding>
                            <ListItemButton
                                onClick={ () => handleOpen(item) }
                                sx={ {
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: item.read_at ? 'rgba(15,43,102,0.08)' : '#03288C',
                                    backgroundColor: item.read_at ? 'white' : 'rgba(3, 40, 140, 0.03)',
                                    px: 2,
                                    py: 1.5,
                                } }
                            >
                                <ListItemText
                                    primary={
                                        <Stack direction="row" spacing={ 1 } alignItems="center" justifyContent="space-between">
                                            <Typography variant="subtitle1" fontWeight={ 700 }>{ item.title }</Typography>
                                            { !item.read_at && <Chip label="New" color="primary" size="small" /> }
                                        </Stack>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.secondary" sx={ { mt: 0.5, mb: 0.5 } }>
                                                { item.body }
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                { formatDate(item.created_at) }
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    )) }
                </List>
            ) }
        </Container>
    );
};

export default Notifications;

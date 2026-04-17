import { Box, Container, Typography, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const sections = [
    {
        title: '1. Information Collection and Use',
        points: [
            'This privacy policy applies to the Gfuture app ("Application") for mobile devices created by Bluerayinternational ("Service Provider") as a free service, intended for use "AS IS".',
            'The Application collects information when you download and use it, including your device IP address, pages/screens visited, visit date and time, time spent, and operating system.',
            'The Application collects device location data to support geolocation features, recommendations, location-based services, analytics, and app improvements.',
            'Aggregated and anonymized location data may be transmitted periodically to external services that help improve the Application and optimize offerings.',
            'The Application does not use Artificial Intelligence (AI) technologies to process your data or provide features.',
            'For better service, you may be asked to provide personally identifiable information, which is retained and used as described in this policy.',
        ],
    },
    {
        title: '2. Third Party Access',
        points: [
            'Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and service.',
            'Information may be disclosed as required by law, such as to comply with legal process.',
            'Information may be disclosed in good faith to protect rights, user safety, investigate fraud, or respond to government requests.',
            'Information may be shared with trusted service providers working on behalf of the Service Provider under confidentiality and policy obligations.',
        ],
    },
    {
        title: '3. Opt-Out Rights',
        points: [
            'You can stop all information collection by uninstalling the Application using standard uninstall processes available on your device or app marketplace.',
        ],
    },
    {
        title: '4. Data Retention Policy',
        points: [
            'The Service Provider retains user-provided data for as long as you use the Application and for a reasonable time thereafter.',
            'To request deletion of user-provided data, contact bluerayinternational4@gmail.com.',
        ],
    },
    {
        title: '5. Children',
        points: [
            'The Application is not used to knowingly solicit data from or market to children under 13 years of age.',
            'If a child has provided personally identifiable information, contact bluerayinternational4@gmail.com so corrective action can be taken.',
            'You must also be at least 16 years of age to consent to processing in your country, unless parent/guardian consent is allowed by law.',
        ],
    },
    {
        title: '6. Security',
        points: [
            'The Service Provider uses physical, electronic, and procedural safeguards to protect processed and maintained information.',
        ],
    },
    {
        title: '7. Changes',
        points: [
            'This Privacy Policy may be updated from time to time for any reason.',
            'Updates will be posted on this page. Continued use of the Application is deemed approval of all changes.',
        ],
    },
    {
        title: '8. Your Consent',
        points: [
            'By using the Application, you consent to the processing of your information as set forth in this Privacy Policy, now and as amended.',
        ],
    },
    {
        title: '9. Contact Us',
        points: [
            'If you have privacy questions while using the Application, contact the Service Provider at bluerayinternational4@gmail.com.',
        ],
    },
];

const PrivacyPolicy = () => {
    return (
        <Box sx={ { minHeight: '80vh', py: { xs: 6, md: 10 } } }>
            <Container maxWidth="md">
                <motion.div initial={ { opacity: 0, y: 24 } } animate={ { opacity: 1, y: 0 } } transition={ { duration: 0.5 } }>
                    <Typography
                        component="h1"
                        sx={ {
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            lineHeight: 1.1,
                            fontSize: { xs: '2rem', md: '3rem' },
                            mb: 1.5,
                        } }
                    >
                        Privacy Policy
                    </Typography>

                    <Typography sx={ { color: '#5a6a80', fontStyle: 'italic', mb: 4 } }>
                        Effective date: 21 March 2026
                    </Typography>

                    <Typography variant="body1" sx={ { color: '#3a4a5e', lineHeight: 1.9, mb: 4 } }>
                        This page is the official public privacy policy for Gfuture and is intended for users,
                        app stores, and regulatory review. The policy explains how information is collected,
                        used, retained, and protected when the Application is used.
                    </Typography>

                    <Divider sx={ { mb: 4 } } />

                    { sections.map((section) => (
                        <Box key={ section.title } sx={ { mb: 4 } }>
                            <Typography
                                component="h2"
                                sx={ {
                                    fontWeight: 800,
                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                    mb: 1.5,
                                    color: '#0E0E2E',
                                } }
                            >
                                { section.title }
                            </Typography>

                            { section.points.map((point, index) => (
                                <Typography key={ index } variant="body1" sx={ { color: '#3a4a5e', lineHeight: 1.85, mb: 1.1 } }>
                                    { `• ${point}` }
                                </Typography>
                            )) }
                        </Box>
                    )) }

                    <Divider sx={ { mt: 2, mb: 3 } } />

                    <Typography variant="body2" sx={ { color: '#6a7789' } }>
                        This policy applies to the Gfuture mobile Application and should be used as the
                        Privacy Policy URL in the Google Play Console.
                    </Typography>
                </motion.div>
            </Container>
        </Box>
    );
};

export default PrivacyPolicy;
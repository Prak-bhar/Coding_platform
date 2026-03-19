import axios from 'axios';

// For a real application, you'd store these in .env
// JDOODLE_CLIENT_ID=your_client_id
// JDOODLE_CLIENT_SECRET=your_client_secret
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || 'demo_client_id';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || 'demo_client_secret';

export const runCode = async (req, res) => {
    try {
        const { code, language, stdin } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        // Map frontend language formats to JDoodle expected values
        let jdoodleLang = '';
        let versionIndex = '0'; // Default version

        switch (language.toLowerCase()) {
            case 'python':
            case 'py':
                jdoodleLang = 'python3';
                versionIndex = '4';
                break;
            case 'javascript':
            case 'js':
                jdoodleLang = 'nodejs';
                versionIndex = '4';
                break;
            case 'java':
                jdoodleLang = 'java';
                versionIndex = '4';
                break;
            case 'cpp':
            case 'c++':
                jdoodleLang = 'cpp17';
                versionIndex = '1';
                break;
            case 'c':
                jdoodleLang = 'c';
                versionIndex = '5';
                break;
            default:
                return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        const payload = {
            clientId: JDOODLE_CLIENT_ID,
            clientSecret: JDOODLE_CLIENT_SECRET,
            script: code,
            language: jdoodleLang,
            versionIndex: versionIndex,
            stdin: stdin || ''
        };

        const response = await axios.post('https://api.jdoodle.com/v1/execute', payload);
        
        // JDoodle returns: { output: "...", statusCode: 200, memory: "...", cpuTime: "..." }
        res.json({
            output: response.data.output,
            memory: response.data.memory,
            cpuTime: response.data.cpuTime,
            error: response.data.error || null
        });

    } catch (error) {
        console.error('Compiler proxy error:', error?.response?.data || error.message);
        res.status(500).json({ message: 'Code execution failed. Please try again later.' });
    }
};

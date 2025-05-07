export default {
    name: 'resumeConfig',
    title: 'Resume Configuration',
    type: 'document',
    fields: [
        {
            name: 'displayLocation',
            title: 'Display Location',
            type: 'string',
            description: 'Where to display the resume download button',
            options: {
                list: [
                    { title: 'Home Page', value: 'home' },
                    { title: 'Contact Page', value: 'contact' },
                    { title: 'Don\'t Show', value: 'none' }
                ]
            },
            initialValue: 'contact'
        }
    ]
}

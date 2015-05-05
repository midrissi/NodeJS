# Author: Mohamed IDRISSI
# Date: 04/01/2015

FROM ubuntu:trusty
MAINTAINER Mohamed IDRISSI "med.idrissi@outlook.com"

# for mscorefonts-installer
RUN echo "==> Upgrade source" && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get -y upgrade && \
    echo "==> Install Unoconv and NodeJS" && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install -y unoconv && \
    \
    echo "==> Install Fonts" && \
    echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections && \
    apt-get install -y \
    fonts-arphic-ukai fonts-arphic-uming fonts-ipafont-mincho fonts-ipafont-gothic fonts-unfonts-core nodejs npm build-essential \
    language-pack-zh-hant \
    ttf-wqy-zenhei && \
    \
    echo "==> Clean up" && \
    apt-get clean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists

# Define default command.
CMD ["bash"]